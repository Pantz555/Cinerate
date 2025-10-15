"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  Edit,
  Trash2,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface MovieCommentsProps {
  movieId: Id<"movies">;
  currentUserId?: Id<"users">;
  user?: Doc<"users">;
}

interface CommentItemProps {
  comment: any;
  currentUserId?: Id<"users">;
  isDeleting: boolean;
  onReply: (commentId: Id<"movieComments">) => void;
  onEdit: (commentId: Id<"movieComments">, content: string) => void;
  onDelete: (commentId: Id<"movieComments">) => void;
  onReact: (
    commentId: Id<"movieComments">,
    reactionType: "like" | "dislike",
  ) => void;
  userReactions: Record<string, "like" | "dislike">;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  userReactions,
  isDeleting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);

  const { data: replies } = useQuery(
    api.movieComments.getCommentReplies,
    showReplies ? { parentCommentId: comment._id } : "skip",
  );

  const userReaction = userReactions[comment._id];
  const isOwner = currentUserId === comment.userId;

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment._id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditContent(comment.content);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className="size-8 shrink-0 rounded-full bg-gray-200 dark:bg-[#292d38] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: comment.user?.image
              ? `url("${comment.user.image}")`
              : undefined,
          }}
        >
          {!comment.user.image && (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
              {comment.user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="bg-gray-200 dark:bg-[#1a1d23] border-border darK:border dark:border-[#292d38] p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <p className="text-foreground text-sm font-semibold">
                  {comment.user.name || "Anonymous"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {timeAgo(comment._creationTime)}
                  {comment.isEdited && " (edited)"}
                </p>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-foreground  transition-colors p-1"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(comment._id)}
                    className="text-foreground hover:text-red-400 transition-colors p-1"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 dark:bg-[#292d38] border-border border dark:border-[#3d4252] rounded text-muted-foreground text-sm resize-none "
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditSubmit} size="sm">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground/90 text-sm leading-relaxed">
                {comment.content}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-[#9ea4b7] mt-2 px-2">
            <button
              className={`flex items-center gap-1.5 text-xs hover:text-foreground transition-colors ${
                userReaction === "like" ? "text-blue-400" : ""
              }`}
              onClick={() => onReact(comment._id, "like")}
            >
              <ThumbsUp
                className={`h-3 w-3 ${userReaction === "like" ? "fill-current text-blue-600" : ""}`}
              />{" "}
              {comment.likesCount}
            </button>
            <button
              className={`flex items-center gap-1.5 text-xs  transition-colors hover:text-foreground ${
                userReaction === "dislike" ? "text-red-400" : ""
              }`}
              onClick={() => onReact(comment._id, "dislike")}
            >
              <ThumbsDown
                className={`h-3 w-3 ${userReaction === "dislike" ? "fill-current" : ""}`}
              />{" "}
              {comment.dislikesCount}
            </button>
            <button
              className="flex items-center gap-1.5 text-xs  transition-colors"
              onClick={() => onReply(comment._id)}
            >
              <Reply className="h-3 w-3" /> Reply
            </button>
            {(comment.repliesCount || 0) > 0 && (
              <button
                className="flex items-center gap-1.5 text-xs  transition-colors"
                onClick={() => setShowReplies(!showReplies)}
              >
                <MessageCircle className="h-3 w-3" />
                {showReplies ? "Hide" : "Show"} {comment.repliesCount} replies
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}

      <AnimatePresence>
        {showReplies && replies && replies.length > 0 && (
          <motion.div
            className="ml-8 space-y-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {replies.map((reply) => (
              <motion.div
                key={reply._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <CommentItem
                  comment={reply}
                  isDeleting={isDeleting}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReact={onReact}
                  userReactions={userReactions}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function MovieComments({
  movieId,
  currentUserId,
  user,
}: MovieCommentsProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Id<"movieComments"> | null>(
    null,
  );
  const [replyContent, setReplyContent] = useState("");
  const [paginationOpts, setPaginationOpts] = useState({
    numItems: 10,
    cursor: null as string | null,
  });

  const [isCommenting, setIsCommenting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: comments } = useQuery(api.movieComments.getMovieComments, {
    movieId,
    paginationOpts,
  });

  const { data: userReactions } = useQuery(
    api.movieComments.getUserCommentReactions,
    {
      commentIds: comments?.page?.map((c) => c._id) || [],
    },
  );

  const addComment = useMutation(api.movieComments.addMovieComment);
  const editComment = useMutation(api.movieComments.editMovieComment);
  const deleteComment = useMutation(api.movieComments.deleteMovieComment);
  const reactToComment = useMutation(api.movieComments.reactToComment);

  const handleAddComment = async () => {
    if (!currentUserId) {
      toast.error("Please log in to comment");
      router.push("/login");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsCommenting(true);
    try {
      await addComment({
        movieId,
        content: newComment,
      });
      setNewComment("");
      setIsCommenting(false);

      toast.success("Comment added!");
    } catch (error: any) {
      setIsCommenting(false);

      toast.error(error.message || "Failed to add comment");
    }
  };

  const handleAddReply = async () => {
    if (!currentUserId) {
      toast.error("Please log in to reply");
      router.push("/login");
      return;
    }

    if (!replyContent.trim() || !replyingTo) {
      toast.error("Reply cannot be empty");
      return;
    }

    setIsReplying(true);
    try {
      await addComment({
        movieId,
        content: replyContent,
        parentCommentId: replyingTo,
      });
      setReplyContent("");
      setIsReplying(false);

      setReplyingTo(null);
      toast.success("Reply added!");
    } catch (error: any) {
      setIsReplying(false);

      toast.error(error.message || "Failed to add reply");
    }
  };

  const handleEditComment = async (
    commentId: Id<"movieComments">,
    content: string,
  ) => {
    try {
      setIsEditing(true);
      await editComment({ commentId, content });
      setIsEditing(false);

      toast.success("Comment updated!");
    } catch (error: any) {
      setIsEditing(false);
      toast.error(error.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: Id<"movieComments">) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setIsDeleting(true);
    try {
      await deleteComment({ commentId });
      setIsDeleting(false);

      toast.success("Comment deleted!");
    } catch (error: any) {
      setIsDeleting(false);

      toast.error(error.message || "Failed to delete comment");
    }
  };

  const handleReactToComment = async (
    commentId: Id<"movieComments">,
    reactionType: "like" | "dislike",
  ) => {
    if (!currentUserId) {
      toast.error("Please log in to react");
      router.push("/login");
      return;
    }

    try {
      await reactToComment({ commentId, reactionType });
    } catch (error: any) {
      toast.error(error.message || "Failed to react to comment");
    }
  };

  const loadMore = () => {
    setPaginationOpts({
      numItems: 10,
      cursor: comments?.continueCursor as any,
    });
  };

  return (
    <section>
      <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tight mb-4">
        Comments
      </h2>

      {/* Add new comment */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div
            className="size-8 shrink-0 rounded-full bg-gray-200 dark:bg-[#292d38] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: user?.image
                ? `url("${user?.image}")`
                : undefined,
            }}
          >
            {!user?.image && (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                currentUserId
                  ? "Write a comment..."
                  : "Please log in to comment"
              }
              className="w-full p-3 darK:bg-[#1a1d23] border dark:border-[#292d38] rounded-lg text-muted-foreground text-sm resize-none dark:placeholder-[#9ea4b7] placeholder-foreground"
              rows={3}
              maxLength={1000}
              disabled={!currentUserId}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {newComment.length}/1000 characters
              </p>
              <Button
                onClick={handleAddComment}
                disabled={
                  !currentUserId ||
                  !newComment.trim() ||
                  isCommenting ||
                  isDeleting ||
                  isEditing ||
                  isReplying
                }
                size="sm"
                className="flex text-white items-center gap-2"
              >
                {isCommenting ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply form */}
      {replyingTo && (
        <div className="mb-6 ml-8 p-4 bg-card dark:bg-[#1a1d23] border border-border dark:border-[#292d38] rounded-lg">
          <p className="text-muted-foreground text-sm font-medium mb-2">
            Replying to comment:
          </p>
          <div className="flex gap-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 p-3 bg-background dark:bg-[#292d38] border-border dark:border-[#3d4252] rounded text-foreground text-sm resize-none"
              rows={2}
              maxLength={1000}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              onClick={() => {
                setReplyingTo(null);
                setReplyContent("");
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              disabled={isCommenting || isDeleting || isEditing || isReplying}
              onClick={handleAddReply}
              size="sm"
              className="flex items-center justify-center"
            >
              {isReplying ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                "Reply"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="flex flex-col gap-6">
        <AnimatePresence>
          {comments?.page?.length ? (
            comments.page.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <CommentItem
                  isDeleting={isDeleting}
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={setReplyingTo}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReact={handleReactToComment}
                  userReactions={userReactions || {}}
                />
              </motion.div>
            ))
          ) : (
            <p className="text-foreground/70 text-sm">
              No comments yet. Be the first to comment!
            </p>
          )}
        </AnimatePresence>

        {comments && !comments.isDone && (
          <div className="flex justify-center mt-6">
            <Button onClick={loadMore} variant="outline">
              Load More Comments
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
