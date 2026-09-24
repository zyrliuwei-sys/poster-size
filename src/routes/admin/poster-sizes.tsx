import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { PosterSizeItem } from '@/types/poster-size';
import { Archive, Pencil, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { TextField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const sizeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  region: z.string().min(1),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  unit: z.string().min(1),
  aspectRatio: z.string().min(1),
  description: z.string().min(1),
  sortOrder: z.coerce.number().int(),
});
type SizeForm = z.infer<typeof sizeSchema>;
const emptyForm: SizeForm = {
  slug: '',
  name: '',
  category: 'print',
  region: '',
  width: 0,
  height: 0,
  unit: 'mm',
  aspectRatio: '',
  description: '',
  sortOrder: 0,
};

function PosterSizesAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PosterSizeItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ['admin-poster-sizes', debouncedSearch],
    queryFn: () =>
      apiGet<PosterSizeItem[]>(
        `/api/admin/poster-sizes${debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ''}`
      ),
  });

  const form = useForm({
    defaultValues: emptyForm,
    validators: { onSubmit: sizeSchema },
    onSubmit: async ({ value }) => {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...value });
      } else {
        await createMutation.mutateAsync(value);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (value: SizeForm) => apiPost('/api/admin/poster-sizes', value),
    onSuccess: () => {
      toast.success(m['admin.poster_sizes.save']());
      setDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-poster-sizes'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: (value: SizeForm & { id: string }) =>
      apiPut('/api/admin/poster-sizes', value),
    onSuccess: () => {
      toast.success(m['admin.poster_sizes.save']());
      setDialogOpen(false);
      setEditing(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-poster-sizes'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/admin/poster-sizes?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-poster-sizes'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openCreate() {
    setEditing(null);
    form.reset(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: PosterSizeItem) {
    setEditing(item);
    form.reset({
      slug: item.slug,
      name: item.name,
      category: item.category,
      region: item.region,
      width: item.width,
      height: item.height,
      unit: item.unit,
      aspectRatio: item.aspectRatio,
      description: item.description,
      sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {m['admin.poster_sizes.title']()}
          </h1>
          <p className="text-muted-foreground">
            {m['admin.poster_sizes.description']()}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> {m['admin.poster_sizes.new']()}
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{m['admin.poster_sizes.title']()}</CardTitle>
            <CardDescription>
              {m['admin.poster_sizes.description']()}
            </CardDescription>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m['admin.poster_sizes.search']()}
              className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
            />
          </label>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-3 py-3">
                    {m['admin.poster_sizes.field_name']()}
                  </th>
                  <th className="px-3 py-3">
                    {m['admin.poster_sizes.field_category']()}
                  </th>
                  <th className="px-3 py-3">
                    {m['admin.poster_sizes.field_region']()}
                  </th>
                  <th className="px-3 py-3">
                    {m['admin.poster_sizes.field_ratio']()}
                  </th>
                  <th className="px-3 py-3 text-right">
                    {m['common.table.refresh']()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.data?.map((item) => (
                  <tr className="border-b last:border-0" key={item.id}>
                    <td className="px-3 py-3 font-medium">
                      {item.name}
                      <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                        {item.width} × {item.height} {item.unit}
                      </span>
                    </td>
                    <td className="px-3 py-3">{item.category}</td>
                    <td className="px-3 py-3">{item.region}</td>
                    <td className="px-3 py-3">{item.aspectRatio}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">
                            {m['admin.poster_sizes.edit']()}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => archiveMutation.mutate(item.id)}
                        >
                          <Archive className="size-4" />
                          <span className="sr-only">
                            {m['admin.poster_sizes.archive']()}
                          </span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!query.isPending && !query.data?.length && (
              <p className="text-muted-foreground py-10 text-center text-sm">
                {m['admin.poster_sizes.empty']()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? m['admin.poster_sizes.edit_title']()
                : m['admin.poster_sizes.create_title']()}
            </DialogTitle>
            <DialogDescription>
              {m['admin.poster_sizes.description']()}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <form.Field name="name">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_name']()}
                    required
                  />
                )}
              </form.Field>
              <form.Field name="slug">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_slug']()}
                    required
                  />
                )}
              </form.Field>
              <form.Field name="category">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_category']()}
                    required
                  />
                )}
              </form.Field>
              <form.Field name="region">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_region']()}
                    required
                  />
                )}
              </form.Field>
              <form.Field name="width">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_width']()}
                    type="number"
                    required
                  />
                )}
              </form.Field>
              <form.Field name="height">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_height']()}
                    type="number"
                    required
                  />
                )}
              </form.Field>
              <form.Field name="unit">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_unit']()}
                    required
                  />
                )}
              </form.Field>
              <form.Field name="aspectRatio">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_ratio']()}
                    required
                  />
                )}
              </form.Field>
              <form.Field name="sortOrder">
                {(field) => (
                  <TextField
                    field={field}
                    label={m['admin.poster_sizes.field_order']()}
                    type="number"
                    required
                  />
                )}
              </form.Field>
              <div className="sm:col-span-2">
                <form.Field name="description">
                  {(field) => (
                    <TextField
                      field={field}
                      label={m['admin.poster_sizes.field_description']()}
                      required
                    />
                  )}
                </form.Field>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {m['admin.poster_sizes.cancel']()}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {m['admin.poster_sizes.save']()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/admin/poster-sizes')({
  component: PosterSizesAdminPage,
});
