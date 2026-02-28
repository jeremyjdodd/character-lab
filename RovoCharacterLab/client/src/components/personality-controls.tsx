import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import type { PersonalityTraits } from "@shared/schema";

interface PersonalityControlsProps {
  traits: PersonalityTraits;
  onTraitsChange: (traits: PersonalityTraits) => void;
  onUpdateResponse: () => void;
  isUpdating: boolean;
  "data-testid"?: string;
}

export function PersonalityControls({
  traits,
  onTraitsChange,
  onUpdateResponse,
  isUpdating,
  "data-testid": dataTestId,
}: PersonalityControlsProps) {
  const traitLabels = {
    tone: { low: "Formal", high: "Enthusiastic" },
    initiative: { low: "Responsive", high: "Proactive" },
    depth: { low: "Concise", high: "Comprehensive" },
    outputStyle: { low: "Structured", high: "Creative" },
  };

  const getTraitLabel = (trait: keyof PersonalityTraits, value: number) => {
    const labels = traitLabels[trait];
    const label = value > 5 ? labels.high : labels.low;
    return `${label} (${value}/10)`;
  };

  const handleTraitChange = (trait: keyof PersonalityTraits, value: number[]) => {
    onTraitsChange({
      ...traits,
      [trait]: value[0],
    });
  };

  return (
    <Card data-testid={dataTestId}>
      <CardHeader className="pb-4">
        <h4 className="font-medium text-foreground flex items-center">
          <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
          Personality Trait Adjustments
        </h4>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tone Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Tone</Label>
            <span 
              className="text-xs text-muted-foreground"
              data-testid={`${dataTestId}-tone-value`}
            >
              {getTraitLabel("tone", traits.tone)}
            </span>
          </div>
          <Slider
            value={[traits.tone]}
            onValueChange={(value) => handleTraitChange("tone", value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
            data-testid={`${dataTestId}-tone-slider`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Formal</span>
            <span>Enthusiastic</span>
          </div>
        </div>

        {/* Initiative Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Initiative</Label>
            <span 
              className="text-xs text-muted-foreground"
              data-testid={`${dataTestId}-initiative-value`}
            >
              {getTraitLabel("initiative", traits.initiative)}
            </span>
          </div>
          <Slider
            value={[traits.initiative]}
            onValueChange={(value) => handleTraitChange("initiative", value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
            data-testid={`${dataTestId}-initiative-slider`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Responsive</span>
            <span>Proactive</span>
          </div>
        </div>

        {/* Depth Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Depth</Label>
            <span 
              className="text-xs text-muted-foreground"
              data-testid={`${dataTestId}-depth-value`}
            >
              {getTraitLabel("depth", traits.depth)}
            </span>
          </div>
          <Slider
            value={[traits.depth]}
            onValueChange={(value) => handleTraitChange("depth", value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
            data-testid={`${dataTestId}-depth-slider`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Concise</span>
            <span>Comprehensive</span>
          </div>
        </div>

        {/* Output Style Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Output Style</Label>
            <span 
              className="text-xs text-muted-foreground"
              data-testid={`${dataTestId}-output-style-value`}
            >
              {getTraitLabel("outputStyle", traits.outputStyle)}
            </span>
          </div>
          <Slider
            value={[traits.outputStyle]}
            onValueChange={(value) => handleTraitChange("outputStyle", value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
            data-testid={`${dataTestId}-output-style-slider`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Structured</span>
            <span>Creative</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={onUpdateResponse}
          disabled={isUpdating}
          data-testid={`${dataTestId}-update-button`}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {isUpdating ? "Updating..." : "Update Response B"}
        </Button>
      </CardContent>
    </Card>
  );
}
