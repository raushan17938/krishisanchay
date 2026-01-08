import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Mic,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Leaf
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { chatWithAI } from "../api/ai";

const MessageFormatter = ({ content }) => {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
};

const AIAdvisor = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: t('ai.advisorSubtitle'),
      time: "2 min ago"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Quick questions could also be translated if added to generic JSONs
  // For now, keeping them simple or generic
  const quickQuestions = [
    t('ai.placeholder')
  ];

  const aiFeatures = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: t('ai.advisorTitle'),
      description: t('ai.advisorSubtitle')
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Market Analysis",
      description: "Price predictions and trends"
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Disease Identification",
      description: "Instant crop disease detection"
    }
  ];

  const handleSendMessage = async (message) => {
    const messageToSend = message || newMessage.trim();
    if (!messageToSend) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: messageToSend,
      time: "Now"
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      // Use the API service
      // Construct history in the format expected by backend/service
      const history = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'bot',
        content: msg.content
      }));

      const data = await chatWithAI(messageToSend, history, i18n.language);

      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          content: data.reply,
          time: "Now"
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.message || "Failed to get response");
      }

    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        content: "Sorry, connection failed. Please try again.",
        time: "Now"
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return <div className="min-h-screen bg-background pt-20 lg:pt-8">
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          {t('ai.advisorTitle')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('ai.advisorSubtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI Power
            </h3>
            <div className="space-y-4">
              {aiFeatures.map((feature, index) => <div key={index} className="flex items-start gap-3">
                <div className="bg-gradient-primary w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>)}
            </div>
          </Card>

          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Quick Questions</h3>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => <Button
                key={index}
                variant="ghost"
                className="w-full text-left text-sm justify-start h-auto py-2 px-3 hover:bg-primary/10"
                onClick={() => handleSendMessage(question)}
              >
                {question}
              </Button>)}
            </div>
          </Card>

          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Queries Solved</span>
                <span className="font-bold text-primary">2,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Happy Farmers</span>
                <span className="font-bold text-green-500">1,923</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Rating</span>
                <span className="font-bold text-yellow-500">4.8⭐</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="farm-card h-[600px] flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <div className="bg-gradient-primary w-12 h-12 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{t('ai.advisorTitle')}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-muted-foreground">Online</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-gradient-earth" : "bg-gradient-primary"}`}>
                  {message.type === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>

                <div className={`max-w-[80%] ${message.type === "user" ? "text-right" : ""}`}>
                  <div className={`p-3 rounded-2xl ${message.type === "user" ? "bg-gradient-earth text-white" : "bg-muted"}`}>
                    <p className="leading-relaxed"><MessageFormatter content={message.content} /></p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-3">
                    {message.time}
                  </p>
                </div>
              </div>)}

              {isTyping && <div className="flex gap-3">
                <div className="bg-gradient-primary w-8 h-8 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:200ms]" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:400ms]" />
                  </div>
                </div>
              </div>}
            </div>

            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Mic className="w-5 h-5" />
                </Button>

                <Input
                  placeholder={t('ai.placeholder')}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim()}
                  className="btn-farm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>;
};

export default AIAdvisor;
