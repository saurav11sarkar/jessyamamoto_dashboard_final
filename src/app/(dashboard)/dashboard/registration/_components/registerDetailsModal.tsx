import Image from "next/image";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,

} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RegisterDetails({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto p-4 sm:max-w-2xl sm:p-8">
        {/* Top Info Section */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Name:</p>
            <p className="text-xl font-bold text-gray-900">Jonson</p>
            
            <p className="pt-4 text-sm font-medium text-gray-500">Country:</p>
            <p className="font-bold text-gray-900">USA</p>
            
            <p className="pt-4 text-sm font-medium text-gray-500">Email:</p>
            <p className="text-green-600">example@gmail.com</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Phone Number:</p>
            <p className="text-xl font-bold text-gray-900">+2196412365</p>
            
            <p className="pt-4 text-sm font-medium text-gray-500">Registration Date:</p>
            <p className="font-bold text-gray-900">25/05/2024</p>
            
            <p className="pt-4 text-sm font-medium text-gray-500">Service:</p>
            <p className="text-green-600">Residential Cleaning</p>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button className="bg-green-600 px-10 hover:bg-green-700">Accept</Button>
          <Button variant="destructive" className="bg-red-700 px-10 hover:bg-red-800">
            Reject Account
          </Button>
        </div>

        {/* Business Card Section */}
        <div className="mt-8 flex flex-col items-center">
          <p className="mb-4 font-bold text-gray-800">Business Card:</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Replace src with your actual image paths */}
            <div className="overflow-hidden rounded-xl border-4 border-emerald-800/20">
              <Image src="/card-front.png" alt="Card Front" width={180} height={100} className="object-cover" />
            </div>
            <div className="overflow-hidden rounded-xl border-4 border-emerald-800/20">
              <Image src="/card-back.png" alt="Card Back" width={180} height={100} className="object-cover" />
            </div>
          </div>
          
          <Button className="mt-6 flex w-full max-w-xs items-center gap-2 bg-[#3ee0cf] py-6 hover:bg-[#3ee0cf]/80">
            <Download size={18} />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
