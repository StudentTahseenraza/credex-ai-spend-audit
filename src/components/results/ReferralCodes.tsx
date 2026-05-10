'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Share2, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

interface ReferralCodesProps {
  auditId: string;
}

export function ReferralCodes({ auditId }: ReferralCodesProps) {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
  const loadReferralCode = async () => {
    const stored = localStorage.getItem(`referral_${auditId}`);

    if (stored) {
      setReferralCode(stored);
    } else {
      const newCode = `CREX${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      localStorage.setItem(`referral_${auditId}`, newCode);
      setReferralCode(newCode);
    }
  };

  void loadReferralCode();
}, [auditId]);

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!referralCode) return null;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Refer & Earn</h3>
        </div>
        
        <p className="text-sm text-purple-700 mb-3">
          Share this tool with other startups. When they complete an audit, you both get 10% off Credex credits!
        </p>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input 
              value={referralCode}
              readOnly
              className="bg-white font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(referralCode)}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => copyToClipboard(referralLink)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Your Referral Link
          </Button>
        </div>
        
        <p className="text-xs text-purple-600 mt-3">
          ✨ Referral credits stack! Maximum 50% off first purchase.
        </p>
      </CardContent>
    </Card>
  );
}