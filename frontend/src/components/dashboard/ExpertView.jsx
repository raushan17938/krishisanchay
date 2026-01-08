import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle, TrendingUp } from "lucide-react";

const ExpertView = ({ stats }) => {
    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <MessageCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Queries</p>
                            <h3 className="text-2xl font-bold">{stats?.pendingQueries || 5}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Questions Solved</p>
                            <h3 className="text-2xl font-bold">{stats?.answeredQueries || 120}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Impact Score</p>
                            <h3 className="text-2xl font-bold">{stats?.rating || 4.8}/5</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Priority Questions</h3>
                        <Button variant="link">View All</Button>
                    </div>

                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6 border-l-4 border-l-yellow-500">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Urgent</span>
                                <span className="text-sm text-muted-foreground">2 hours ago</span>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">My wheat crop has yellow spots on leaves</h4>
                            <p className="text-muted-foreground text-sm mb-4">
                                I noticed these spots appearing after yesterday's rain. Is this rust or something else? I have attached photos.
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                                    <span className="text-sm font-medium">Rajesh Kumar</span>
                                </div>
                                <Button size="sm">Answer Now</Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div>
                    <Card className="p-6 bg-primary/5 border-primary/20">
                        <h3 className="font-semibold text-primary mb-4">Expert Tips</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2">
                                <span className="text-primary">•</span>
                                Check high-resolution images before diagnosing fungal diseases.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary">•</span>
                                Always suggest organic alternatives first when possible.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary">•</span>
                                Follow up on severe cases within 48 hours.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ExpertView;
