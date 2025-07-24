import { useState, useRef, useEffect } from "react";
import { Build, Enemy } from "../types";
import { parseTextToBuild } from "../textParser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Loader2, AlertCircle, User, Shield, FileText } from "lucide-react";
import { ImagePreview } from "./ImageModal";
import importExample from "../assets/images/import-copy-example.png";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBuild: (build: Build) => void;
  onImportEnemy: (enemy: Enemy) => void;
  mode?: "build" | "enemy";
}

function extractWeakenResistance(text: string): number {
  // Look for "Weaken Resistance" followed by a number
  const match = text.match(/Weaken Resistance\s+([\d,]+)/i);
  if (match) {
    return parseInt(match[1].replace(/,/g, ""), 10);
  }
  return 0;
}

export function ImportDialog({
  isOpen,
  onClose,
  onImportBuild,
  onImportEnemy,
  mode = "build",
}: ImportDialogProps) {
  const [name, setName] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [importType, setImportType] = useState<"build" | "enemy">(mode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  async function handleImport() {
    setIsLoading(true);
    setError(null);

    if (!pastedText.trim()) {
      setError("Please paste the build text");
      setIsLoading(false);
      return;
    }

    try {
      const buildName =
        name.trim() ||
        (importType === "enemy" ? "Imported Enemy" : "Imported Build");
      const parsedBuild = parseTextToBuild(pastedText, buildName);

      if (importType === "build") {
        onImportBuild(parsedBuild);
      } else {
        // Convert build data to enemy format
        const enemyData: Enemy = {
          name: buildName,
          meleeEndurance: parsedBuild.meleeEndurance || 1000,
          rangedEndurance: parsedBuild.rangedEndurance || 1000,
          magicEndurance: parsedBuild.magicEndurance || 1000,
          meleeEvasion: parsedBuild.meleeEvasion || 0,
          rangedEvasion: parsedBuild.rangedEvasion || 0,
          magicEvasion: parsedBuild.magicEvasion || 0,
          meleeHeavyAttackEvasion: parsedBuild.meleeHeavyAttackEvasion || 0,
          rangedHeavyAttackEvasion: parsedBuild.rangedHeavyAttackEvasion || 0,
          magicHeavyAttackEvasion: parsedBuild.magicHeavyAttackEvasion || 0,
          meleeDefense: parsedBuild.meleeDefense || 500,
          rangedDefense: parsedBuild.rangedDefense || 500,
          magicDefense: parsedBuild.magicDefense || 500,
          damageReduction: parsedBuild.damageReduction || 0,
          skillDamageResistance: parsedBuild.skillDamageResistance || 0,
          weakenResistance: extractWeakenResistance(pastedText),
        };
        onImportEnemy(enemyData);
      }

      setPastedText("");
      setName("");
      onClose();
    } catch (err) {
      console.error("Text parsing error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to parse build text"
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setPastedText("");
    setName("");
    setError(null);
    onClose();
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      handleClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import {importType === "build" ? "Build" : "Enemy"} Data
          </DialogTitle>
          <DialogDescription>
            Import {importType === "build" ? "character build" : "enemy"}
            from questlog.gg build page
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label>Import Type</Label>
            <Select
              value={importType}
              onValueChange={(value: "build" | "enemy") => setImportType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="build">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Character Build
                  </div>
                </SelectItem>
                <SelectItem value="enemy">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Enemy/Target
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="build-text">Build Stats Text</Label>
            <Textarea
              ref={textareaRef}
              id="build-text"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your copied build stats here..."
              rows={8}
              disabled={isLoading}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Copy and paste the complete stats text from questlog.gg, including
              weapon damage values
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-name">
              {importType === "build" ? "Build" : "Enemy"} Name (optional)
            </Label>
            <Input
              id="import-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                importType === "build"
                  ? "My Imported Build"
                  : "My Imported Enemy"
              }
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || !pastedText.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? "Importing..."
                : `Import ${importType === "build" ? "Build" : "Enemy"}`}
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="text-sm font-medium">How to use:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                Go to your build page on{" "}
                <a
                  href="https://questlog.gg/throne-and-liberty/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  questlog.gg (English version)
                </a>
              </li>
              <li>Make sure the full stats tab is opened and not filtered</li>
              <li>Select all the text (Ctrl+A / Cmd+A)</li>
              <li>Copy the text (Ctrl+C / Cmd+C)</li>
              <li>
                Paste it in the text area above (Ctrl+V / Cmd+V) and click
                Import
              </li>
            </ol>

            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Example:</p>
              <ImagePreview
                src={importExample}
                alt="Example of how to copy stats from questlog.gg"
                className="w-full"
              />
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              <strong>Note:</strong> Text import can extract weapon damage
              values and most character stats automatically.
              {importType === "build"
                ? " Make sure to include the weapon damage section in your selection."
                : " Enemy stats like defense, evasion, and resistances will be parsed from the text."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
