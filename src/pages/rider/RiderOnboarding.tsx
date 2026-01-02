import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, ChevronRight, ChevronLeft, Truck, Check } from "lucide-react";
import { z } from "zod";

const phoneSchema = z.string().min(10, "Phone number must be at least 10 digits");

const vehicleTypes = [
  { value: "motorcycle", label: "Motorcycle", description: "Small deliveries" },
  { value: "van", label: "Van", description: "Medium livestock" },
  { value: "refrigerated_van", label: "Refrigerated Van", description: "Processed meat" },
  { value: "livestock_truck", label: "Livestock Truck", description: "Live cattle" },
];

const RiderOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [phone, setPhone] = useState("");
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file under 5MB",
          variant: "destructive",
        });
        return;
      }
      setFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate("/auth?redirect=/rider/onboarding");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate phone
      phoneSchema.parse(phone);

      // Create rider profile
      const { data: riderData, error: riderError } = await supabase
        .from("riders")
        .insert({
          user_id: user.id,
          phone,
          verification_status: "pending",
        })
        .select()
        .single();

      if (riderError) throw riderError;

      // Create vehicle
      if (vehicleType && plateNumber) {
        const { error: vehicleError } = await supabase.from("vehicles").insert({
          rider_id: riderData.id,
          vehicle_type: vehicleType,
          plate_number: plateNumber,
          model: vehicleModel || null,
          color: vehicleColor || null,
        });

        if (vehicleError) throw vehicleError;
      }

      // Create wallet
      const { error: walletError } = await supabase.from("rider_wallets").insert({
        rider_id: riderData.id,
      });

      if (walletError) throw walletError;

      // Add rider role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "rider",
      });

      // Ignore duplicate role error
      if (roleError && !roleError.message.includes("duplicate")) {
        console.error("Role error:", roleError);
      }

      toast({
        title: "Application Submitted!",
        description: "Your rider application is being reviewed. We'll notify you once verified.",
      });

      navigate("/rider");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return phone.length >= 10;
      case 2:
        return idDocumentFile !== null;
      case 3:
        return selfieFile !== null;
      case 4:
        return vehicleType && plateNumber;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/rider"))}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Become a Rider</h1>
          <p className="text-muted-foreground">Step {step} of {totalSteps}</p>
          <Progress value={progress} className="mt-2" />
        </div>

        {/* Step 1: Phone */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Enter your phone number for delivery coordination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: ID Document */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>
                Upload a valid government-issued ID (NIN, Driver's License, or Voter's Card)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={idInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, setIdDocumentFile)}
              />
              <div
                onClick={() => idInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {idDocumentFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Check className="h-8 w-8 text-green-600" />
                    <p className="font-medium">{idDocumentFile.name}</p>
                    <p className="text-sm text-muted-foreground">Tap to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">Upload ID Document</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Selfie */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Photo Verification</CardTitle>
              <CardDescription>
                Take a clear selfie for identity verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => handleFileChange(e, setSelfieFile)}
              />
              <div
                onClick={() => selfieInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {selfieFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Check className="h-8 w-8 text-green-600" />
                    <p className="font-medium">{selfieFile.name}</p>
                    <p className="text-sm text-muted-foreground">Tap to retake</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">Take Selfie</p>
                    <p className="text-sm text-muted-foreground">Clear photo of your face</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Vehicle */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>
                Add your delivery vehicle details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="plate">Plate Number</Label>
                <Input
                  id="plate"
                  placeholder="ABC 123 XY"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="model">Vehicle Model (Optional)</Label>
                <Input
                  id="model"
                  placeholder="e.g. Toyota Hiace"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="color">Vehicle Color (Optional)</Label>
                <Input
                  id="color"
                  placeholder="e.g. White"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-6">
          {step < totalSteps ? (
            <Button
              className="w-full"
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={!canProceed() || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderOnboarding;
