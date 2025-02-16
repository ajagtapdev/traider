"use client"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const Chatbot: React.FC = () => {
    return (
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow mt-6">
            <CardHeader>
                <CardTitle className="text-[#408830]">AI Trading Assistant</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <Input placeholder="Ask me anything about trading..." className="flex-1" />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-[#408830] hover:bg-[#509048]">Send</Button>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
}


export default Chatbot;