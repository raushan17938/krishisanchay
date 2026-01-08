import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  MessageCircle,
  Heart,
  Share,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Mic,
  Image as ImageIcon,
  X,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { getPosts, createPost, likePost, deletePost, commentOnPost } from "../api/posts";
import { getMe } from "../api/auth";
import { useToast } from "@/hooks/use-toast";
// Assuming useAuth exists or we get user from somewhere else. If not, maybe we don't need it explicitly if axios intercepts. 
// Actually, for creating post we need auth. Axios handles token.

const CommunityForum = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Tag input state (simplified for now)
  const [selectedTags, setSelectedTags] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Simple JWT decode
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          setUserId(decoded.id);

          // Fetch full profile for display name/avatar
          const response = await getMe();
          if (response.success) {
            setCurrentUser(response.data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    fetchUser();
  }, []);

  const fetchPosts = async (query = "") => {
    try {
      setLoading(true);
      const queryString = query ? `?search=${query}` : "";
      const response = await getPosts(queryString);
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(searchQuery);
  }, [searchQuery]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "Image too large", description: "Max 10MB allowed", variant: "destructive" });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !imageFile) return;

    try {
      const formData = new FormData();
      formData.append('content', newPost);
      if (selectedTags.length > 0) {
        // You might need to stringify array or append one by one depending on backend multer/bodyparser interaction.
        // Mongoose array usually works with repeated keys or stringified JSON if parsed manually.
        // Let's preserve logic: passing as JSON string might be safest if backend parses it, or rely on body-parser which works with simple fields. 
        // Multer parses body fields too. 
        // Safest for arrays in FormData is to append same key multiple times.
        selectedTags.forEach(tag => formData.append('tags', tag));
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await createPost(formData);
      if (response.data.success) {
        setPosts([response.data.data, ...posts]); // Optimistic update or waiting for response
        setNewPost("");
        removeImage();
        toast({ title: "Post created successfully" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await likePost(postId);
      if (response.data.success) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return { ...post, likes: response.data.data };
          }
          return post;
        }));
      }
    } catch (error) {
      // Handle error (maybe user not logged in)
      console.error(error);
      toast({ title: "Please login to like posts", variant: "destructive" });
    }
  };

  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const response = await commentOnPost(postId, { text: commentText });
      if (response.data.success) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return { ...post, comments: response.data.data };
          }
          return post;
        }));
        setCommentText("");
        toast({ title: "Comment added" });
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  const toggleComments = (postId) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(postId);
      setCommentText(""); // Reset text when switching
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await deletePost(postId);
      if (response.data.success) {
        setPosts(posts.filter(post => post._id !== postId));
        toast({ title: "Post deleted successfully" });
      }
    } catch (error) {
      console.error("Failed to delete post", error);
      toast({ title: "Failed to delete post", variant: "destructive" });
    }
  };

  const categories = [
    { name: "Crop Information", count: 234 },
    { name: "Disease & Treatment", count: 189 },
    { name: "Market Prices", count: 156 },
    { name: "Technology", count: 98 },
    { name: "Success Stories", count: 145 }
  ];
  return <div className="min-h-screen bg-background pt-20 lg:pt-8">
    <div className="container mx-auto px-6 py-8">
      {
        /* Header */
      }
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Farmer Community
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Share your experience, ask questions and connect with millions of farmers across India
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {
          /* Sidebar */
        }
        <div className="lg:col-span-1 space-y-6">
          {
            /* Quick Stats */
          }
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Members</span>
                <span className="font-bold text-primary">50,248</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Today's Posts</span>
                <span className="font-bold text-primary">127</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Now</span>
                <span className="font-bold text-green-500">2,345</span>
              </div>
            </div>
          </Card>

          {
            /* Categories */
          }
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category, index) => <div key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <span className="text-sm">{category.name}</span>
                <Badge variant="secondary" className="text-xs">{category.count}</Badge>
              </div>)}
            </div>
          </Card>

          {
            /* Trending Topics */
          }
          <Card className="farm-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trending
            </h3>
            <div className="space-y-2">
              <Badge className="mr-2 mb-2 bg-primary/10 text-primary">#WheatCrop</Badge>
              <Badge className="mr-2 mb-2 bg-accent/20 text-accent-foreground">#OrganicFarming</Badge>
              <Badge className="mr-2 mb-2 bg-secondary/50 text-secondary-foreground">#DripIrrigation</Badge>
              <Badge className="mr-2 mb-2 bg-primary/10 text-primary">#CropInsurance</Badge>
            </div>
          </Card>
        </div>

        {
          /* Main Content */
        }
        <div className="lg:col-span-3 space-y-6">
          {
            /* Search and Filter */
          }
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

          </div>

          {
            /* Create Post */
          }
          <Card className="farm-card">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 bg-gradient-primary flex items-center justify-center">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <Users className="w-6 h-6 text-white" />}
                  </span>
                )}
              </Avatar>

              <div className="flex-1">
                {currentUser && (
                  <p className="text-sm font-semibold mb-2 text-primary">{currentUser.name}</p>
                )}
                <Textarea
                  placeholder="Share your experience or ask a question..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="resize-none mb-4"
                  rows={3}
                />

                {imagePreview && (
                  <div className="relative mb-4 inline-block">
                    <img src={imagePreview} alt="Preview" className="h-32 rounded-md object-cover" />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="image-upload"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 text-muted-foreground cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Photo
                    </label>
                  </div>

                  <Button className="btn-farm" onClick={handleCreatePost}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {
            /* Posts */
          }
          {loading ? (
            <div className="text-center py-10">Loading posts...</div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => <Card key={post._id} className="farm-card hover:shadow-glow transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-12 h-12 bg-gradient-earth flex items-center justify-center">
                    {post.author?.avatar ? (
                      <img src={post.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold">
                        {post.author?.name ? post.author.name.charAt(0) : "U"}
                      </span>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{post.author?.name || "Unknown"}</h4>
                        {/* Location not in model yet, hidden or static */}
                      </div>
                      {userId && post.author?._id === userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8 rounded-full"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

                  {post.image && (
                    <div className="mb-3">
                      <img src={post.image} alt="Post content" className="rounded-lg max-h-96 w-full object-cover" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {post.tags && post.tags.map((tag, index) => <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>)}
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => handleLike(post._id)}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${post.likes && post.likes.includes(userId) ? "fill-current text-red-500" : ""}`} />
                    {post.likes ? post.likes.length : 0}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-muted-foreground hover:text-primary ${activeCommentId === post._id ? "text-primary bg-primary/10" : ""}`}
                    onClick={() => toggleComments(post._id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.comments ? post.comments.length : 0}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-blue-500"
                    onClick={() => {
                      const shareData = {
                        title: 'Krishi Sanchay Post',
                        text: post.content,
                        url: window.location.href // Or specific post URL if routing exists
                      };
                      if (navigator.share) {
                        navigator.share(shareData).catch((err) => { });
                      } else {
                        navigator.clipboard.writeText(`${post.content} - ${window.location.href}`);
                        toast({ title: "Link copied to clipboard" });
                      }
                    }}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Comment Section */}
                {activeCommentId === post._id && (
                  <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <Avatar className="w-8 h-8">
                              {comment.avatar ? (
                                <img src={comment.avatar} alt={comment.name} className="object-cover" />
                              ) : (
                                <div className="bg-primary/20 w-full h-full flex items-center justify-center text-primary font-bold text-xs">
                                  {comment.name ? comment.name.charAt(0) : "U"}
                                </div>
                              )}
                            </Avatar>
                            <div className="flex-1 bg-muted/50 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold">{comment.name}</span>
                                <span className="text-xs text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-foreground/90">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground text-sm py-2">No comments yet. Be the first!</p>
                      )}
                    </div>

                    <div className="flex gap-3 items-center">
                      <Avatar className="w-8 h-8">
                        {currentUser?.avatar ? (
                          <img src={currentUser.avatar} alt="Me" className="object-cover" />
                        ) : (
                          <div className="bg-primary/20 w-full h-full flex items-center justify-center text-primary font-bold text-xs">
                            {currentUser?.name ? currentUser.name.charAt(0) : "U"}
                          </div>
                        )}
                      </Avatar>
                      <Input
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post._id);
                        }}
                      />
                      <Button size="sm" onClick={() => handleCommentSubmit(post._id)}>
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </Card>)}
            </div>
          )}

          {
            /* Load More */
          }
          <div className="text-center">
            <Button variant="outline" className="w-full sm:w-auto">
              Load More Posts
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>;
};
var stdin_default = CommunityForum;
export {
  stdin_default as default
};
