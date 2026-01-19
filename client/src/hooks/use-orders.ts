import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateOrderRequest, type UpdateOrderRequest } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Refetch every 5 seconds to get latest orders
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [api.orders.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch order");
      return api.orders.get.responses[200].parse(await res.json());
    },
    refetchInterval: (query) => {
      // Poll active orders every 3 seconds
      const data = query.state.data;
      if (data && ['pending', 'accepted', 'in_progress'].includes(data.status)) {
        return 3000;
      }
      return false;
    }
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      // Validation handled by backend/zod, but we ensure correct types here
      const res = await apiRequest("POST", api.orders.create.path, data);
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateOrderRequest) => {
      const url = buildUrl(api.orders.update.path, { id });
      const res = await apiRequest("PUT", url, updates);
      return api.orders.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.get.path, variables.id] });
    },
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: [api.drivers.list.path],
    queryFn: async () => {
      const res = await fetch(api.drivers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch drivers");
      return api.drivers.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Poll driver locations every 10s
  });
}
