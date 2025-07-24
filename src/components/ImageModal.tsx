import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Maximize2 } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <X className="h-4 w-4" />
          </Button>
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ src, alt, className = "" }: ImagePreviewProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`relative group cursor-pointer ${className}`} onClick={() => setShowModal(true)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-lg border border-border"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            <span className="text-sm">Click to enlarge</span>
          </div>
        </div>
      </div>
      <ImageModal
        src={src}
        alt={alt}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}