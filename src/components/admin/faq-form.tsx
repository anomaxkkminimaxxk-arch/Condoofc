import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateFaq, useUpdateFaq } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";
import type { Faq } from "@/lib/api-client";

const formSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  order_index: z.number().int().default(0),
});

export function FaqForm({ faq }: { faq?: Faq }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const isEditing = !!faq;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: faq?.question || "",
      answer: faq?.answer || "",
      order_index: faq?.order_index || 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateFaq.mutate({ id: faq.id, data: values }, {
        onSuccess: () => { setOpen(false); toast({ title: "FAQ updated" }); },
      });
    } else {
      createFaq.mutate({ data: values as any }, {
        onSuccess: () => { setOpen(false); form.reset(); toast({ title: "FAQ created" }); },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing
          ? <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/20"><Edit className="w-4 h-4" /></Button>
          : <Button className="bg-primary hover:bg-primary/80 neon-glow"><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-primary/30 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-xl">{isEditing ? "EDIT FAQ" : "ADD FAQ"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="question" render={({ field }) => (
              <FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="answer" render={({ field }) => (
              <FormItem><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="order_index" render={({ field }) => (
              <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="bg-background border-primary/30" /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/80 neon-glow" disabled={createFaq.isPending || updateFaq.isPending}>
              {isEditing ? "SAVE CHANGES" : "CREATE FAQ"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
