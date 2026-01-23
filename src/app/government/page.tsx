
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GOVERNMENT_SERVICES } from "@/lib/government";
import { Check, CircleUser, FileText, Landmark, MessageSquareWarning } from "lucide-react";

export default function GovernmentPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">E-Service Portal</h1>
        <p className="text-lg text-muted-foreground">
          Your one-stop shop for government services.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleUser /> User Account & Identity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Secure your account and access personalized services by linking your
            National ID or state-issued credentials.
          </p>
          <Button variant="outline" className="mt-4">
            Link Your ID
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText /> Apply for Services
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {GOVERNMENT_SERVICES.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
              <Button>Apply</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check /> Track Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Check the real-time status of your applications for permits,
            certificates, and licenses.
          </p>
          <Button variant="outline" className="mt-4">
            Track Applications
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark /> Digital Payments & Revenue Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Pay your state taxes and fees securely through our digital payment
            platform.
          </p>
          <Button variant="outline" className="mt-4">
            Pay Taxes & Fees
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareWarning /> Public Feedback & Issue Reporting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Submit complaints and service requests directly to relevant MDAs.
          </p>
          <Button variant="outline" className="mt-4">
            Submit a Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
