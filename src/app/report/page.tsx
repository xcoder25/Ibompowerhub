
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/context/loading-context";

export default function ReportPage() {
  const { isLoading, setIsLoading } = useLoading();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Report Submitted",
        description: "Thank you for helping improve our community!",
      });
      // Here you would typically reset form fields
    }, 3000);
  };

  return (
    <div className="flex justify-center items-center h-full p-4">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Submit a Report</CardTitle>
            <CardDescription>
              Found an issue? Let us know and we&apos;ll get right on it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Ministry/Department/Agency</Label>
                <Select>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="next">
                      Ministry of Works and Housing
                    </SelectItem>
                    <SelectItem value="sveltekit">
                      Ministry of Health
                    </SelectItem>
                    <SelectItem value="astro">
                      Ministry of Education
                    </SelectItem>
                    <SelectItem value="nuxt">
                      Ministry of Transport
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Title</Label>
                <Input id="name" placeholder="Enter a title for your report" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              Submit
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
