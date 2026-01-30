import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Share2, Link as LinkIcon, Mail, Check, Facebook, Twitter, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

const ShareButtons = ({ surveyId, surveyTitle }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/surveys/${surveyId}/take`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`Responda a este inquérito: ${surveyTitle}`);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success('Link copiado!');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        toast.error('Falha ao copiar link');
      }
    }
  };

  const shareViaEmail = () => {
    const subject = `Responda a este inquérito: ${surveyTitle}`;
    const body = `Olá,\n\nConvido-o(a) a responder a este inquérito do IMPAR:\n\n"${surveyTitle}"\n\n${shareUrl}\n\nObrigado!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const newWindow = window.open(fbUrl, 'facebook-share', 'width=600,height=400');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Popup blocked, open in new tab
      window.open(fbUrl, '_blank');
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    const newWindow = window.open(twitterUrl, 'twitter-share', 'width=600,height=400');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.open(twitterUrl, '_blank');
    }
  };

  const shareToLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    const newWindow = window.open(linkedinUrl, 'linkedin-share', 'width=600,height=400');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.open(linkedinUrl, '_blank');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none border-zinc-200 dark:border-zinc-700"
          data-testid="share-button"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Partilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none w-48">
        <DropdownMenuItem onClick={copyToClipboard} data-testid="share-copy-link">
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <LinkIcon className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copiado!' : 'Copiar Link'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail} data-testid="share-email">
          <Mail className="w-4 h-4 mr-2" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} data-testid="share-facebook">
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} data-testid="share-twitter">
          <Twitter className="w-4 h-4 mr-2" />
          Twitter/X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedin} data-testid="share-linkedin">
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
