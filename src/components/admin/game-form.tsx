import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateGame, useUpdateGame } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";
import type { Game } from "@/lib/api-client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().optional(),
  link: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  is_featured: z.boolean().default(false),
});

export function GameForm({ game }: { game?: Game }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const isEditing = !!game;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: game?.name || "",
      description: game?.description || "",
      image_url: game?.image_url || "",
      link: game?.link || "",
      category: game?.category || "Condo",
      is_featured: game?.is_featured || false,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateGame.mutate({ id: game.id, data: values }, {
        onSuccess: () => { setOpen(false); toast({ title: "Game updated" }); },
      });
    } else {
      createGame.mutate({ data: values as any }, {
        onSuccess: () => { setOpen(false); form.reset(); toast({ title: "Game created" }); },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing
          ? <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20"><Edit className="w-4 h-4" /></Button>
          : <Button className="bg-primary hover:bg-primary/80 neon-glow"><Plus className="w-4 h-4 mr-2" /> Add Game</Button>
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-primary/30 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-xl">{isEditing ? "EDIT GAME" : "ADD GAME"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="image_url" render={({ field }) => (
              <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem><FormLabel>Roblox Link</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="is_featured" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-primary/30 p-4">
                <FormLabel className="text-base">Featured</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/80 neon-glow" disabled={createGame.isPending || updateGame.isPending}>
              {isEditing ? "SAVE CHANGES" : "CREATE GAME"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
