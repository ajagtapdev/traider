"use client"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Contexts: React.FC = () => {
    return (
        <Card className="bg-white shadow-lg gap-6">
        <CardHeader>
        <CardTitle className="text-[#408830]">Market Contexts</CardTitle>
        </CardHeader>
        <CardContent>
        <ScrollArea className="h-[240px] rounded-md border p-3">
            <div className="space-y-3">
            <div className="bg-[#fdf6e9] p-3 rounded">
                <p className="font-medium text-[#408830]">Market Event 1</p>
                <p className="text-sm text-gray-600">
                The market is...
                </p>
            </div>
            <div className="bg-[#fdf6e9] p-3 rounded">
                <p className="font-medium text-[#408830]">Market Event 2</p>
                <p className="text-sm text-gray-600">
                The market is...
                </p>
            </div>
            <div className="bg-[#fdf6e9] p-3 rounded">
                <p className="font-medium text-[#408830]">Market Event 3</p>
                <p className="text-sm text-gray-600">
                The market is...
                </p>
            </div>
            </div>
        </ScrollArea>
        </CardContent>
        </Card>
    );
}

export default Contexts;