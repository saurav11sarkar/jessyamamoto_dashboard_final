// "use client";

// import React from "react";
// import {
//   Plus,
//   SquarePen,
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   X,
// } from "lucide-react";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import DynamicPageHeader from "@/components/PageHeader";
// import { useSession } from "next-auth/react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import { Country, CountryResponse } from "@/types/countryDataType";
// import { toast } from "sonner";

// export default function CountryTable() {
//   const [page, setPage] = React.useState(1);

//   // ================= MODAL STATE =================
//   const [open, setOpen] = React.useState(false);

//   // ================= EDIT MODAL STATE =================
//   const [editOpen, setEditOpen] = React.useState(false);
//   const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(
//     null,
//   );

//   // ================= FORM STATE =================
//   const [countryName, setCountryName] = React.useState("");
//   const [cityInput, setCityInput] = React.useState("");
//   const [cities, setCities] = React.useState<string[]>([]);
//   // ================= DELETE MODAL STATE =================
//   const [deleteOpen, setDeleteOpen] = React.useState(false);
//   const [deleteId, setDeleteId] = React.useState<string | null>(null);

//   const [image, setImage] = React.useState<File | null>(null);
//   const [imagePreview, setImagePreview] = React.useState("");

//   const queryClient = useQueryClient();

//   const session = useSession();
//   const token = session?.data?.user?.accessToken || "";

//   // ================= FETCH COUNTRY =================
//   const { data, isLoading } = useQuery<CountryResponse>({
//     queryKey: ["country", page],
//     queryFn: async () => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country?page=${page}&limit=10`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!res.ok) {
//         throw new Error("Failed to fetch countries");
//       }

//       return res.json();
//     },
//     enabled: !!token,
//   });

//   // ================= ADD COUNTRY =================
//   const addCountryMutation = useMutation({
//     mutationFn: async () => {
//       const formData = new FormData();

//       formData.append("countryName", countryName);

//       cities.forEach((city) => {
//         formData.append("cityName", city);
//       });

//       if (image) {
//         formData.append("image", image);
//       }

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         },
//       );

//       const data = await res.json();

//       // backend error message show korbe
//       if (!res.ok) {
//         throw new Error(data?.message || "Failed to add country");
//       }

//       return data;
//     },

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["country"],
//       });

//       toast.success("Country added successfully");
//       setOpen(false);
//     },

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     onError: (err: any) => {
//       toast.error(err?.message || "Failed to add country");
//     },
//   });

//   // ================= UPDATE COUNTRY =================
//   const updateCountryMutation = useMutation({
//     mutationFn: async () => {
//       if (!selectedCountry) return;

//       const formData = new FormData();

//       formData.append("countryName", countryName);

//       cities.forEach((city) => {
//         formData.append("cityName", city);
//       });

//       if (image) {
//         formData.append("image", image);
//       }

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country/${selectedCountry._id}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         },
//       );

//       const data = await res.json();

//       // backend error message show korbe
//       if (!res.ok) {
//         throw new Error(data?.message || "Update failed");
//       }

//       return data;
//     },

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["country"],
//       });

//       setEditOpen(false);
//       toast.success("Country updated successfully");
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     onError: (err: any) => {
//       toast.error(err?.message || "Update failed");
//     },
//   });

//   // ================= DELETE COUNTRY =================
//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country/${id}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!res.ok) {
//         throw new Error("Delete failed");
//       }

//       return res.json();
//     },

//     onSuccess: () => {
//       toast.success("Country deleted successfully");
//       queryClient.invalidateQueries({
//         queryKey: ["country"],
//       });
//     },
//   });

//   // ================= RESET FORM =================
//   const resetForm = () => {
//     setCountryName("");
//     setCities([]);
//     setCityInput("");
//     setSelectedCountry(null);

//     setImage(null);
//     setImagePreview("");
//   };

//   // ================= HANDLE EDIT =================
//   const handleEdit = (country: Country) => {
//     setSelectedCountry(country);

//     setCountryName(country.countryName || "");
//     setCities(country.cityName || []);

//     setImage(null);
//     setImagePreview(country.image || "");

//     setEditOpen(true);
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];

//     if (!file) return;

//     setImage(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   // ================= ADD CITY =================
//   const handleAddCity = () => {
//     if (!cityInput.trim()) return;

//     setCities((prev) => [...prev, cityInput]);
//     setCityInput("");
//   };

//   // ================= REMOVE CITY =================
//   const handleRemoveCity = (city: string) => {
//     setCities((prev) => prev.filter((c) => c !== city));
//   };

//   // ================= PAGINATION =================
//   const total = data?.meta?.total || 0;
//   const limit = data?.meta?.limit || 10;

//   const totalPages = Math.ceil(total / limit);

//   // ================= OPEN DELETE MODAL =================
//   const handleDeleteClick = (id: string) => {
//     setDeleteId(id);
//     setDeleteOpen(true);
//   };

//   // ================= CONFIRM DELETE =================
//   const handleConfirmDelete = () => {
//     if (!deleteId) return;

//     deleteMutation.mutate(deleteId);

//     setDeleteOpen(false);
//     setDeleteId(null);
//   };

//   return (
//     <div className="min-h-screen">
//       {/* HEADER */}
//       <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8 mb-8">
//         <DynamicPageHeader pageTitle="Countries" />

//         <Button
//           onClick={() => {
//             resetForm();
//             setOpen(true);
//           }}
//           className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11"
//         >
//           <Plus className="w-5 h-5" />
//           Add Country
//         </Button>
//       </div>

//       {/* ================= ADD COUNTRY MODAL ================= */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Add Country</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-5 mt-4">
//             {/* COUNTRY NAME */}
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Country Name
//               </label>

//               <Input
//                 placeholder="Enter country name"
//                 value={countryName}
//                 onChange={(e) => setCountryName(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Country Image
//               </label>

//               <Input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />

//               {imagePreview && (
//                 <img
//                   src={imagePreview}
//                   alt="Preview"
//                   className="mt-3 h-32 w-full object-cover rounded-lg border"
//                 />
//               )}
//             </div>

//             {/* CITY INPUT */}
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Add Cities
//               </label>

//               <div className="flex gap-2">
//                 <Input
//                   placeholder="Enter city name"
//                   value={cityInput}
//                   onChange={(e) => setCityInput(e.target.value)}
//                 />

//                 <Button
//                   type="button"
//                   onClick={handleAddCity}
//                   className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
//                 >
//                   Add
//                 </Button>
//               </div>
//             </div>

//             {/* CITY LIST */}
//             {cities.length > 0 && (
//               <div className="flex flex-wrap gap-2">
//                 {cities.map((city, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full"
//                   >
//                     <span className="text-sm">{city}</span>

//                     <button
//                       onClick={() => handleRemoveCity(city)}
//                       className="text-red-500"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* SUBMIT BUTTON */}
//             <Button
//               onClick={() => addCountryMutation.mutate()}
//               disabled={addCountryMutation.isPending}
//               className="w-full bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
//             >
//               {addCountryMutation.isPending ? "Adding..." : "Add Country"}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ================= EDIT COUNTRY MODAL ================= */}
//       <Dialog open={editOpen} onOpenChange={setEditOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               Edit {selectedCountry?.countryName || "Country"}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-5 mt-4">
//             {/* COUNTRY NAME */}
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Country Name
//               </label>

//               <Input
//                 placeholder="Enter country name"
//                 value={countryName}
//                 onChange={(e) => setCountryName(e.target.value)}
//               />
//             </div>

//             {/* COUNTRY IMAGE */}
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Country Image
//               </label>

//               <Input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />

//               {imagePreview && (
//                 <div className="mt-3">
//                   <img
//                     src={imagePreview}
//                     alt="Country Preview"
//                     className="w-full h-40 object-cover rounded-lg border"
//                   />
//                 </div>
//               )}
//             </div>

//             {/* CITY INPUT */}
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Add Cities
//               </label>

//               <div className="flex gap-2">
//                 <Input
//                   placeholder="Enter city name"
//                   value={cityInput}
//                   onChange={(e) => setCityInput(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       handleAddCity();
//                     }
//                   }}
//                 />

//                 <Button
//                   type="button"
//                   onClick={handleAddCity}
//                   className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
//                 >
//                   Add
//                 </Button>
//               </div>
//             </div>

//             {/* CITY LIST */}
//             {cities.length > 0 && (
//               <div className="flex flex-wrap gap-2">
//                 {cities.map((city, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full"
//                   >
//                     <span className="text-sm">{city}</span>

//                     <button
//                       type="button"
//                       onClick={() => handleRemoveCity(city)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* ACTION BUTTONS */}
//             <div className="flex justify-end gap-3 pt-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setEditOpen(false)}
//                 disabled={updateCountryMutation.isPending}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 onClick={() => updateCountryMutation.mutate()}
//                 disabled={updateCountryMutation.isPending}
//                 className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 min-w-[140px]"
//               >
//                 {updateCountryMutation.isPending
//                   ? "Updating..."
//                   : "Update Country"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* TABLE */}
//       <div className="border-t border-[#B6B6B6] rounded-sm">
//         <Table>
//           <TableHeader>
//             <TableRow className="hover:bg-transparent border-[#B6B6B6]">
//               <TableHead className="py-4 font-bold px-8 text-slate-800">
//                 Country Image
//               </TableHead>

//               <TableHead className="py-4 font-bold px-8 text-slate-800">
//                 Country Name
//               </TableHead>

//               <TableHead className="py-4 font-bold px-8 text-slate-800">
//                 Cities
//               </TableHead>

//               <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
//                 Created Date
//               </TableHead>

//               <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
//                 Action
//               </TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {isLoading ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={4}
//                   className="text-center py-10 text-slate-500"
//                 >
//                   Loading...
//                 </TableCell>
//               </TableRow>
//             ) : data?.data?.length ? (
//               data.data.map((country) => (
//                 <TableRow
//                   key={country._id}
//                   className="border-b border-[#B6B6B6]"
//                 >
//                   {/* COUNTRY IMAGE */}
//                   <TableCell className="py-6 font-medium px-8 text-slate-700">
//                     {country.image ? (
//                       <img
//                         src={country.image}
//                         alt={country.countryName}
//                         className="w-16 h-16 object-cover rounded-full"
//                       />
//                     ) : (
//                       "No Image"
//                     )}
//                   </TableCell>

//                   {/* COUNTRY NAME */}
//                   <TableCell className="py-6 font-medium px-8 text-slate-700">
//                     {country.countryName || "No Country Name"}
//                   </TableCell>

//                   {/* CITIES */}
//                   <TableCell className="py-6 px-8 text-slate-600">
//                     {country.cityName?.length > 0 ? (
//                       <div className="flex flex-wrap gap-2">
//                         {country.cityName.map((city, index) => (
//                           <span
//                             key={index}
//                             className="px-3 py-1 rounded-full bg-slate-100 text-sm"
//                           >
//                             {city}
//                           </span>
//                         ))}
//                       </div>
//                     ) : (
//                       "No Cities"
//                     )}
//                   </TableCell>

//                   {/* DATE */}
//                   <TableCell className="py-6 text-center px-8 text-slate-600">
//                     {new Date(country.createdAt).toLocaleDateString()}
//                   </TableCell>

//                   {/* ACTION */}
//                   <TableCell className="py-6 px-8">
//                     <div className="flex items-center justify-center gap-4">
//                       {/* EDIT */}
//                       <button
//                         onClick={() => handleEdit(country)}
//                         className="text-slate-600 hover:text-blue-600 transition-colors"
//                       >
//                         <SquarePen className="w-5 h-5" />
//                       </button>

//                       {/* DELETE */}
//                       <button
//                         onClick={() => handleDeleteClick(country._id)}
//                         className="text-slate-600 hover:text-rose-600 transition-colors"
//                       >
//                         <Trash2 className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={4}
//                   className="text-center py-10 text-slate-500"
//                 >
//                   No Country Found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>

//         {/* PAGINATION */}
//         <div className="flex items-center justify-between px-6 py-4 border-t bg-[#FFFFFF]">
//           <p className="text-sm text-slate-500">
//             Showing page {page} of {totalPages || 1}
//           </p>

//           <div className="flex items-center gap-1">
//             {/* PREV */}
//             <Button
//               variant="outline"
//               size="icon"
//               disabled={page === 1}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               className="h-8 w-8 text-slate-400 bg-slate-50 border-slate-200"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             {/* PAGE BUTTONS */}
//             {Array.from({ length: totalPages || 1 }).map((_, i) => (
//               <Button
//                 key={i}
//                 variant={page === i + 1 ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setPage(i + 1)}
//                 className={`h-8 w-8 ${
//                   page === i + 1
//                     ? "bg-[#3ee0cf] text-white"
//                     : "border-slate-200 text-slate-600"
//                 }`}
//               >
//                 {i + 1}
//               </Button>
//             ))}

//             {/* NEXT */}
//             <Button
//               variant="outline"
//               size="icon"
//               disabled={page === totalPages}
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               className="h-8 w-8 text-slate-600 border-slate-200"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>
//       {/* ================= DELETE CONFIRM MODAL ================= */}
//       <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Delete Country</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-6 py-2">
//             <p className="text-sm text-slate-600">
//               Are you sure you want to delete this country? This action cannot
//               be undone.
//             </p>

//             <div className="flex items-center justify-end gap-3">
//               <Button variant="outline" onClick={() => setDeleteOpen(false)}>
//                 Cancel
//               </Button>

//               <Button
//                 onClick={handleConfirmDelete}
//                 disabled={deleteMutation.isPending}
//                 className="bg-red-500 hover:bg-red-600 text-white"
//               >
//                 {deleteMutation.isPending ? "Deleting..." : "Delete"}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import React from "react";
import {
  Plus,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  GripVertical,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DynamicPageHeader from "@/components/PageHeader";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { City, Country, CountryResponse } from "@/types/countryDataType";
import { toast } from "sonner";

// Interface for City with neighborhoods
interface CityWithNeighborhoods {
  cityName: string;
  neighborhoods: string[];
}

export default function CountryTable() {
  const [page, setPage] = React.useState(1);

  // ================= MODAL STATE =================
  const [open, setOpen] = React.useState(false);

  // ================= EDIT MODAL STATE =================
  const [editOpen, setEditOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(
    null,
  );

  // ================= FORM STATE =================
  const [countryName, setCountryName] = React.useState("");
  const [cityInput, setCityInput] = React.useState("");
  const [cities, setCities] = React.useState<CityWithNeighborhoods[]>([]);

  // ================= DELETE MODAL STATE =================
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const [image, setImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState("");

  const queryClient = useQueryClient();

  const session = useSession();
  const token = session?.data?.user?.accessToken || "";

  // ================= NEIGHBORHOOD MODAL STATE =================
  const [neighborhoodModalOpen, setNeighborhoodModalOpen] =
    React.useState(false);
  const [selectedCityForNeighborhood, setSelectedCityForNeighborhood] =
    React.useState<string>("");
  const [neighborhoodInput, setNeighborhoodInput] = React.useState("");

  // ================= FETCH COUNTRY =================
  const { data, isLoading } = useQuery<CountryResponse>({
    queryKey: ["country", page],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch countries");
      }

      return res.json();
    },
    enabled: !!token,
  });

  // ================= DRAG & DROP REORDER STATE =================
  const [localCountries, setLocalCountries] = React.useState<Country[]>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const rowRefs = React.useRef<(HTMLTableRowElement | null)[]>([]);
  const localCountriesRef = React.useRef<Country[]>([]);

  React.useEffect(() => {
    if (data?.data) setLocalCountries(data.data);
  }, [data?.data]);

  React.useEffect(() => {
    localCountriesRef.current = localCountries;
  }, [localCountries]);

  // ================= REORDER COUNTRY =================
  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderedIds }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to reorder countries");
      }

      return res.json();
    },
    onError: () => {
      toast.error("Failed to reorder countries");
      queryClient.invalidateQueries({ queryKey: ["country"] });
    },
  });

  const handleHandleMouseDown = (index: number) => (
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    e.preventDefault();
    setDraggedIndex(index);
  };

  // ================= MOUSE-BASED DRAG TO REORDER =================
  React.useEffect(() => {
    if (draggedIndex === null) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const getClientY = (e: MouseEvent | TouchEvent) =>
      "touches" in e ? e.touches[0]?.clientY : e.clientY;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = getClientY(e);
      if (clientY === undefined) return;

      const overIndex = rowRefs.current.findIndex((row) => {
        if (!row) return false;
        const rect = row.getBoundingClientRect();
        return clientY >= rect.top && clientY <= rect.bottom;
      });

      if (overIndex === -1 || overIndex === draggedIndex) return;

      setLocalCountries((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(draggedIndex, 1);
        updated.splice(overIndex, 0, moved);
        return updated;
      });
      setDraggedIndex(overIndex);
    };

    const handleUp = () => {
      setDraggedIndex(null);
      reorderMutation.mutate(
        localCountriesRef.current.map((country) => country._id),
      );
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);

    return () => {
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggedIndex]);

  // ================= ADD COUNTRY =================
  const addCountryMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      // Create the data object that matches your backend structure
      const dataObject = {
        countryName: countryName,
        cities: cities,
      };

      // Send as JSON string in 'data' field (matches your backend's req.body.data)
      formData.append("data", JSON.stringify(dataObject));

      if (image) {
        formData.append("image", image);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add country");
      }

      return data;
    },

    onSuccess: async () => {
     await queryClient.refetchQueries({
  queryKey: ["country"],
});

      toast.success("Country added successfully");
      setOpen(false);
      resetForm();
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add country");
    },
  });

  // ================= UPDATE COUNTRY =================
  const updateCountryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCountry) return;

      const formData = new FormData();

      // Create the data object that matches your backend structure
      const dataObject = {
        countryName: countryName,
        cities: cities,
      };

      // Send as JSON string in 'data' field
      formData.append("data", JSON.stringify(dataObject));

      if (image) {
        formData.append("image", image);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country/${selectedCountry._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Update failed");
      }

      return data;
    },

    onSuccess: async () => {
       await queryClient.refetchQueries({
  queryKey: ["country"],
});
      setEditOpen(false);
      toast.success("Country updated successfully");
      resetForm();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || "Update failed");
    },
  });

  // ================= DELETE COUNTRY =================
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/country/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      return res.json();
    },

    onSuccess: async () => {
      toast.success("Country deleted successfully");
        await queryClient.refetchQueries({
  queryKey: ["country"],
});
    },
  });

  // ================= RESET FORM =================
  const resetForm = () => {
    setCountryName("");
    setCities([]);
    setCityInput("");
    setSelectedCountry(null);
    setImage(null);
    setImagePreview("");
    setNeighborhoodInput("");
    setSelectedCityForNeighborhood("");
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setCountryName(country.countryName || "");

    // Handle both old and new data formats
    if (country.cities && Array.isArray(country.cities)) {
      setCities(country.cities);
    } else if (country.cityName && Array.isArray(country.cityName)) {
      // Backward compatibility for old data format
      const oldCities = country.cityName.map((city: string) => ({
        cityName: city,
        neighborhoods: [],
      }));
      setCities(oldCities);
    } else {
      setCities([]);
    }

    setImage(null);
    setImagePreview(country.image || "");
    setEditOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ================= ADD CITY =================
  const handleAddCity = () => {
    if (!cityInput.trim()) return;
    setCities((prev) => [...prev, { cityName: cityInput, neighborhoods: [] }]);
    setCityInput("");
  };

  // ================= REMOVE CITY =================
  const handleRemoveCity = (cityName: string) => {
    setCities((prev) => prev.filter((c) => c.cityName !== cityName));
  };

  // ================= ADD NEIGHBORHOOD =================
  const handleAddNeighborhood = () => {
    if (!neighborhoodInput.trim() || !selectedCityForNeighborhood) return;

    setCities((prev) =>
      prev.map((city) =>
        city.cityName === selectedCityForNeighborhood
          ? {
              ...city,
              neighborhoods: [...city.neighborhoods, neighborhoodInput],
            }
          : city,
      ),
    );
    setNeighborhoodInput("");
    setNeighborhoodModalOpen(false);
  };

  // ================= REMOVE NEIGHBORHOOD =================
  const handleRemoveNeighborhood = (cityName: string, neighborhood: string) => {
    setCities((prev) =>
      prev.map((city) =>
        city.cityName === cityName
          ? {
              ...city,
              neighborhoods: city.neighborhoods.filter(
                (n) => n !== neighborhood,
              ),
            }
          : city,
      ),
    );
  };

  const openNeighborhoodModal = (cityName: string) => {
    setSelectedCityForNeighborhood(cityName);
    setNeighborhoodInput("");
    setNeighborhoodModalOpen(true);
  };

  // ================= PAGINATION =================
  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  // ================= DELETE HANDLERS =================
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // Helper function to render cities and neighborhoods in table
  const renderCitiesAndNeighborhoods = (citiesData?: City[] | string[]) => {
    if (!citiesData || citiesData.length === 0) return "No Cities";

    // Normalize string[] (old format) to City[] (new format)
    const normalizedCities: City[] =
      typeof citiesData[0] === "string"
        ? (citiesData as string[]).map((cityName) => ({
            cityName,
            neighborhoods: [],
          }))
        : (citiesData as City[]);

    return (
      <div className="space-y-3">
        {normalizedCities.map((city, idx) => (
          <div
            key={idx}
            className="border-b border-gray-100 pb-2 last:border-0"
          >
            <div className="font-semibold text-slate-700 mb-1">
              {city.cityName}
            </div>
            {city.neighborhoods && city.neighborhoods.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {city.neighborhoods.map(
                  (neighborhood: string, nIdx: number) => (
                    <span
                      key={nIdx}
                      className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600"
                    >
                      {neighborhood}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-8 mb-8">
        <DynamicPageHeader pageTitle="Countries" />

        <Button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11"
        >
          <Plus className="w-5 h-5" />
          Add Country
        </Button>
      </div>

      {/* ================= ADD COUNTRY MODAL ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Country</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* COUNTRY NAME */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Country Name
              </label>
              <Input
                placeholder="Enter country name"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
              />
            </div>

            {/* COUNTRY IMAGE */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Country Image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 h-32 w-full object-cover rounded-lg border"
                />
              )}
            </div>

            {/* CITY INPUT */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add Cities
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city name"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCity();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCity}
                  className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* CITY LIST WITH NEIGHBORHOODS */}
            {cities.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium block">
                  Cities & Neighborhoods
                </label>
                {cities.map((city, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">
                        {city.cityName}
                      </span>
                      <button
                        onClick={() => handleRemoveCity(city.cityName)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Neighborhoods */}
                    {city.neighborhoods.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {city.neighborhoods.map((neighborhood, nIdx) => (
                          <div
                            key={nIdx}
                            className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-full"
                          >
                            <span className="text-sm">{neighborhood}</span>
                            <button
                              onClick={() =>
                                handleRemoveNeighborhood(
                                  city.cityName,
                                  neighborhood,
                                )
                              }
                              className="text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openNeighborhoodModal(city.cityName)}
                      className="text-[#3ee0cf] border-[#3ee0cf] hover:bg-[#3ee0cf]/10"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Neighborhood
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <Button
              onClick={() => addCountryMutation.mutate()}
              disabled={addCountryMutation.isPending}
              className="w-full bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
            >
              {addCountryMutation.isPending ? "Adding..." : "Add Country"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= NEIGHBORHOOD MODAL ================= */}
      <Dialog
        open={neighborhoodModalOpen}
        onOpenChange={setNeighborhoodModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Neighborhood to {selectedCityForNeighborhood}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter neighborhood name"
                value={neighborhoodInput}
                onChange={(e) => setNeighborhoodInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNeighborhood();
                  }
                }}
              />
              <Button
                onClick={handleAddNeighborhood}
                className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT COUNTRY MODAL ================= */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {selectedCountry?.countryName || "Country"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* COUNTRY NAME */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Country Name
              </label>
              <Input
                placeholder="Enter country name"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
              />
            </div>

            {/* COUNTRY IMAGE */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Country Image
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Country Preview"
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* CITY INPUT */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add Cities
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter city name"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCity();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCity}
                  className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* CITY LIST WITH NEIGHBORHOODS */}
            {cities.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium block">
                  Cities & Neighborhoods
                </label>
                {cities.map((city, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">
                        {city.cityName}
                      </span>
                      <button
                        onClick={() => handleRemoveCity(city.cityName)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Neighborhoods */}
                    {city.neighborhoods.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {city.neighborhoods.map((neighborhood, nIdx) => (
                          <div
                            key={nIdx}
                            className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-full"
                          >
                            <span className="text-sm">{neighborhood}</span>
                            <button
                              onClick={() =>
                                handleRemoveNeighborhood(
                                  city.cityName,
                                  neighborhood,
                                )
                              }
                              className="text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openNeighborhoodModal(city.cityName)}
                      className="text-[#3ee0cf] border-[#3ee0cf] hover:bg-[#3ee0cf]/10"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Neighborhood
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={updateCountryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateCountryMutation.mutate()}
                disabled={updateCountryMutation.isPending}
                className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 min-w-[140px]"
              >
                {updateCountryMutation.isPending
                  ? "Updating..."
                  : "Update Country"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TABLE */}
      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-4 text-slate-800 w-10" />
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Country Image
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Country Name
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Cities & Neighborhoods
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Created Date
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : localCountries.length ? (
              localCountries.map((country, index) => (
                <TableRow
                  key={country._id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className={`border-b border-[#B6B6B6] ${
                    draggedIndex === index ? "opacity-40" : ""
                  }`}
                >
                  {/* DRAG HANDLE */}
                  <TableCell className="py-6 px-4 text-slate-400">
                    <span
                      title="Drag to reorder"
                      className="cursor-grab active:cursor-grabbing inline-flex touch-none select-none"
                      onMouseDown={handleHandleMouseDown(index)}
                      onTouchStart={handleHandleMouseDown(index)}
                    >
                      <GripVertical className="w-5 h-5" />
                    </span>
                  </TableCell>

                  {/* COUNTRY IMAGE */}
                  <TableCell className="py-6 font-medium px-8 text-slate-700">
                    {country.image ? (
                      <img
                        src={country.image}
                        alt={country.countryName}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                    ) : (
                      "No Image"
                    )}
                  </TableCell>

                  {/* COUNTRY NAME */}
                  <TableCell className="py-6 font-medium px-8 text-slate-700">
                    {country.countryName || "No Country Name"}
                  </TableCell>

                  {/* CITIES & NEIGHBORHOODS */}
                  <TableCell className="py-6 px-8 text-slate-600">
                    {renderCitiesAndNeighborhoods(
                      country.cities || country.cityName || [],
                    )}
                  </TableCell>

                  {/* DATE */}
                  <TableCell className="py-6 text-center px-8 text-slate-600">
                    {new Date(country.createdAt).toLocaleDateString()}
                  </TableCell>

                  {/* ACTION */}
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleEdit(country)}
                        className="text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <SquarePen className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(country._id)}
                        className="text-slate-600 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-slate-500"
                >
                  No Country Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-[#FFFFFF]">
          <p className="text-sm text-slate-500">
            Showing page {page} of {totalPages || 1}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 text-slate-400 bg-slate-50 border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages || 1 }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className={`h-8 w-8 ${
                  page === i + 1
                    ? "bg-[#3ee0cf] text-white"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 text-slate-600 border-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Country</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete this country? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
