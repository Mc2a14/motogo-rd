import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useRatingByOrder(orderId: number) {
  return useQuery({
    queryKey: ["ratings", "order", orderId],
    queryFn: async () => {
      const url = buildUrl(api.ratings.getByOrder.path, { orderId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch rating");
      const data = await res.json();
      return data; // Can be null if not rated
    },
    enabled: !!orderId,
  });
}

export function useRatingsByDriver(driverId: string) {
  return useQuery({
    queryKey: ["ratings", "driver", driverId],
    queryFn: async () => {
      const url = buildUrl(api.ratings.getByDriver.path, { driverId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ratings");
      return api.ratings.getByDriver.responses[200].parse(await res.json());
    },
    enabled: !!driverId,
  });
}

export function useCreateRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      orderId: number;
      driverId: string;
      rating: number;
      comment?: string;
    }) => {
      const res = await fetch(api.ratings.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create rating");
      }
      return api.ratings.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["ratings", "order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["ratings", "driver", variables.driverId] });
    },
  });
}

