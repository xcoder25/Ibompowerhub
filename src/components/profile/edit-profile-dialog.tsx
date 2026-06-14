'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EditProfileDialogProps {
    user: {
        name?: string | null;
        bio?: string;
        location?: string;
        profileImageUrl?: string;
    };
    /** Called with text-only fields — these are fast and save immediately */
    onUpdateProfile: (updates: { name?: string; bio?: string; location?: string }) => Promise<void>;
    /** Called with the final permanent image URL once the background upload is done */
    onImageSaved: (url: string) => void;
    /** Called with blob URL instantly when user hits Save, null when upload finishes */
    onPreviewImage: (url: string | null) => void;
}

/** Compress an image File to a smaller JPEG blob using Canvas */
async function compressImage(file: File, maxSizePx = 512, quality = 0.82): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const scale = Math.min(1, maxSizePx / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
                'image/jpeg',
                quality
            );
        };
        img.onerror = reject;
        img.src = objectUrl;
    });
}

export function EditProfileDialog({ user, onUpdateProfile, onImageSaved, onPreviewImage }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore(); // direct Firestore access for background write
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user.name || '');
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSavingText, setIsSavingText] = useState(false);

    useEffect(() => {
        if (open) {
            setName(user.name || '');
            setBio(user.bio || '');
            setLocation(user.location || '');
            setFile(null);
            setPreviewUrl(null);
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSavingText) return;

        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({ title: 'Not signed in', variant: 'destructive' });
            return;
        }

        // Snapshot everything we need before any async work
        const uid = currentUser.uid;
        const capturedFile = file;
        const capturedPreviewUrl = previewUrl;

        setIsSavingText(true);
        try {
            // Save text fields synchronously — this is fast (~200ms)
            await onUpdateProfile({ name, bio, location });
        } catch {
            setIsSavingText(false);
            return;
        }
        setIsSavingText(false);

        if (capturedFile && capturedPreviewUrl) {
            // Show blob preview immediately so the UI updates right away
            onPreviewImage(capturedPreviewUrl);
            // Close dialog NOW — don't make the user wait
            setOpen(false);

            // Background upload — runs without blocking the UI
            ;(async () => {
                try {
                    // Compress client-side (no network — instant)
                    const compressed = await compressImage(capturedFile);

                    // Upload to Vercel Blob via our Next.js API Route
                    const formData = new FormData();
                    formData.append('file', compressed);
                    formData.append('uid', uid);

                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (!uploadRes.ok) {
                        const errText = await uploadRes.text();
                        throw new Error(`Upload failed: ${errText}`);
                    }

                    const { url } = await uploadRes.json();
                    const downloadURL = url; // Vercel Blob returns a direct public URL

                    // Write DIRECTLY to Firestore — no callbacks, no closure issues
                    const userRef = doc(firestore, 'users', uid);
                    await setDoc(userRef, { profileImageUrl: downloadURL }, { merge: true });

                    // Update Firebase Auth photoURL
                    if (auth.currentUser) {
                        await updateProfile(auth.currentUser, { photoURL: downloadURL });
                    }

                    // Tell parent the real URL is ready (updates local state)
                    onImageSaved(downloadURL);
                    // Clear the blob preview — real URL is now showing
                    onPreviewImage(null);

                    toast({ title: 'Profile photo saved!' });
                } catch (err: any) {
                    console.error('Background upload error:', err);
                    onPreviewImage(null); // revert on failure
                    toast({
                        title: 'Photo upload failed',
                        description: err?.message || 'Please try again.',
                        variant: 'destructive',
                    });
                }
            })();
        } else {
            setOpen(false);
            toast({ title: 'Profile saved!' });
        }
    };

    const displayImage = previewUrl || user.profileImageUrl;
    const initials = (name || user.name || 'U').charAt(0).toUpperCase();

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!isSavingText) setOpen(v); }}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Text saves instantly. Photos upload in the background.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-3 mb-1">
                        <Avatar className="h-24 w-24 border-2 border-primary/20">
                            <AvatarImage src={displayImage || undefined} alt={name || 'User'} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isSavingText}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSavingText}
                        >
                            <ImageIcon className="mr-2 h-3.5 w-3.5" />
                            {file ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        {file && (
                            <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                ✓ {file.name}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSavingText} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g. Oron Road, Uyo" value={location} onChange={(e) => setLocation(e.target.value)} disabled={isSavingText} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" placeholder="Tell us a bit about yourself" value={bio} onChange={(e) => setBio(e.target.value)} className="resize-none" disabled={isSavingText} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSavingText} className="min-w-[120px]">
                            {isSavingText
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                                : 'Save changes'
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
