"use client";

import { memo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Award, Loader2 } from "lucide-react";
import Certifications from "../../components/sections/Certifications";
import type { Certification as CertType } from "@/types/resume";

interface CertificationsStepProps {
  certifications: CertType[];
  setCertifications: (certs: CertType[]) => void;
  isAiWorking: boolean;
  aiSuggestCerts: () => void;
  themeColor?: string;
}

const CertificationsStep = memo(function CertificationsStep({
  certifications,
  setCertifications,
  isAiWorking,
  aiSuggestCerts,
  themeColor = "#6366F1",
}: CertificationsStepProps) {
  const hasSeededInitialCertification = useRef(false);

  useEffect(() => {
    if (hasSeededInitialCertification.current) return;

    if (!Array.isArray(certifications) || certifications.length === 0) {
      const nextId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString();

      setCertifications([
        {
          id: nextId,
          name: "",
          issuer: "",
          date: "",
          credential: "",
        },
      ]);
    }

    hasSeededInitialCertification.current = true;
  }, [certifications, setCertifications]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Certifications
          </h3>
          <p className="text-sm text-muted-foreground">
            Show your professional certifications and licenses
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={aiSuggestCerts}
          disabled={isAiWorking}
          style={{
            backgroundColor: themeColor,
            color: 'white',
            borderColor: themeColor
          }}
          onMouseEnter={(e) => {
            if (!isAiWorking) e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isAiWorking ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          AI Suggest
        </Button>
      </div>

      {/* Helper Card */}
      <div className="rounded-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-indigo-500/10">
            <Award className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-indigo-400">Certification Guidelines</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Include industry-recognized certifications relevant to your field</div>
              <div>• Add issuing organization and date obtained</div>
              <div>• Include credential ID if applicable (shows verification)</div>
              <div>• Keep certifications current and relevant to target role</div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications Component */}
      <div className="rounded-xl border border-neutral-700/50 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/20 p-6 shadow-lg">
        <Certifications
          data={
            certifications as unknown as {
              id?: string;
              name?: string;
              issuer?: string;
              date?: string;
              credential?: string;
            }[]
          }
          onChange={(field, value) => {
            if (field === "__replace__")
              setCertifications(
                (
                  value as Array<{
                    id?: string;
                    name?: string;
                    issuer?: string;
                    date?: string;
                    credential?: string;
                  }>
                ).map((v) => ({
                  id: v.id,
                  name: v.name ?? "",
                  issuer: v.issuer ?? "",
                  date: v.date ?? "",
                  credential: v.credential,
                })) as CertType[]
              );
          }}
        />
      </div>

      {/* Pro Tips */}
      <div className="rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="font-semibold text-purple-400">Pro Tips:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>List certifications in reverse chronological order</li>
              <li>Popular tech certs: AWS, Azure, GCP, Kubernetes (CKA), Security+</li>
              <li>PM certs: Scrum Master, PMP, Product Management</li>
              <li>Renew expired certifications or note expiration dates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificationsStep;
