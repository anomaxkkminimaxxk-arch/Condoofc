import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateServer, useUpdateServer } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";
import type { PrivateServer } from "@/lib/api-client";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  image_url: z.string().optional(),
  link: z.string().url(),
  game: z.string().min(1),
  is_active: z.boolean().default(true),
});

export function ServerForm({ server }: { server?: PrivateServer }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createServer = useCreateServer();
  const updateServer = useUpdateServer();
  const isEditing = !!server;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: server?.name || "",
      description: server?.description || "",
      image_url: server?.image_url || "",
      link: server?.link || "",
      game: server?.game || "",
      is_active: server?.is_active ?? true,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateServer.mutate({ id: server.id, data: values }, {
        onSuccess: () => { setOpen(false); toast({ title: "Server updated" }); },
      });
    } else {
      createServer.mutate({ data: values as any }, {
        onSuccess: () => { setOpen(false); form.reset(); toast({ title: "Server created" }); },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing
          ? <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20"><Edit className="w-4 h-4" /></Button>
          : <Button className="bg-primary hover:bg-primary/80 neon-glow"><Plus className="w-4 h-4 mr-2" /> Add Server</Button>
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-primary/30 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-xl">{isEditing ? "EDIT SERVER" : "ADD SERVER"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="game" render={({ field }) => (
              <FormItem><FormLabel>Target Game</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="image_url" render={({ field }) => (
              <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem><FormLabel>Server Link</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="is_active" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-primary/30 p-4">
                <FormLabel className="text-base">Active</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/80 neon-glow" disabled={createServer.isPending || updateServer.isPending}>
              {isEditing ? "SAVE CHANGES" : "CREATE SERVER"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
