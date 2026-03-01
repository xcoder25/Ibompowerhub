'use client';

import { useState, useEffect } from 'react';
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
import { useLoading } from '@/context/loading-context';
import { useStorage, useAuth } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef } from 'react';

interface EditProfileDialogProps {
    user: {
        name?: string | null;
        email?: string | null;
        bio?: string; // New field
        location?: string; // New field
        profileImageUrl?: string;
    };
    onUpdateProfile: (updates: any) => void;
}

export function EditProfileDialog({ user, onUpdateProfile }: EditProfileDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { isLoading, showLoader } = useLoading();
    const storage = useStorage();
    const auth = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user.name || '');
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Reset form when user prop changes (or dialog opens)
    useEffect(() => {
        if (open) {
            setName(user.name || '');
            setBio(user.bio || '');
            setLocation(user.location || '');
            setFile(null);
            setPreviewUrl(null);
        }
    }, [open, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let newProfileImageUrl = user.profileImageUrl;

        if (file && auth.currentUser) {
            setIsUploading(true);
            try {
                const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile_${Date.now()}`);
                await uploadBytes(storageRef, file);
                newProfileImageUrl = await getDownloadURL(storageRef);

                await updateProfile(auth.currentUser, {
                    photoURL: newProfileImageUrl,
                });
            } catch (error) {
                console.error("Error uploading profile image:", error);
                toast({
                    title: 'Upload Failed',
                    description: 'There was an error uploading your profile picture.',
                    variant: 'destructive',
                });
                setIsUploading(false);
                return;
            }
        }

        try {
            await onUpdateProfile({
                name,
                bio,
                location,
                ...(newProfileImageUrl !== user.profileImageUrl ? { profileImageUrl: newProfileImageUrl } : {})
            });

            setOpen(false);
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been updated successfully.',
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: 'Update Failed',
                description: 'There was an error saving your profile changes.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <Avatar className="h-24 w-24 border-2 border-indigo-100">
                            <AvatarImage src={previewUrl || user.profileImageUrl || undefined} alt={name || 'User'} className="object-cover" />
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 text-2xl font-semibold">
                                {name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                {file ? 'Change Image' : 'Upload Image'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="e.g. Oron Road, Uyo"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us a bit about yourself"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? 'Uploading...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
