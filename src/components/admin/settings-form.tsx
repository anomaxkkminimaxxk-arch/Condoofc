import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateSiteSettings } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";
import type { SiteSettings } from "@/lib/api-client";

const formSchema = z.object({
  hero_title: z.string().min(1),
  hero_subtitle: z.string().min(1),
  tiktok_url: z.string().url().optional().or(z.literal("")),
  announcement: z.string().optional().or(z.literal("")),
});

export function SettingsForm({ settings }: { settings?: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const updateSettings = useUpdateSiteSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hero_title: settings?.hero_title || "CONDO UNIVERSE",
      hero_subtitle: settings?.hero_subtitle || "Exclusive Roblox Condo Games & Private Servers",
      tiktok_url: settings?.tiktok_url || "",
      announcement: settings?.announcement || "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        tiktok_url: settings.tiktok_url || "",
        announcement: settings.announcement || "",
      });
    }
  }, [settings, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateSettings.mutate({ data: values }, {
      onSuccess: () => { setOpen(false); toast({ title: "Settings updated" }); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary text-muted-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-primary/30 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-xl">SITE SETTINGS</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="hero_title" render={({ field }) => (
              <FormItem><FormLabel>Hero Title</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="hero_subtitle" render={({ field }) => (
              <FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Textarea {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="announcement" render={({ field }) => (
              <FormItem><FormLabel>Announcement (Optional)</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tiktok_url" render={({ field }) => (
              <FormItem><FormLabel>TikTok URL (Optional)</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/80 neon-glow" disabled={updateSettings.isPending}>
              SAVE SETTINGS
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
