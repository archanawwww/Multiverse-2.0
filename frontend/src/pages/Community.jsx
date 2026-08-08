import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Share2, Play } from 'lucide-react';

const Community = () => {
  const posts = [
    { id: 1, user: 'Alex', action: 'is exploring', target: 'Rainy City', avatar: 'https://i.pravatar.cc/150?u=alex', track: 'Night Call - Kavinsky', likes: 12, comments: 3, time: '2h ago' },
    { id: 2, user: 'Sarah', action: 'created a new playlist', target: 'Midnight Drives', avatar: 'https://i.pravatar.cc/150?u=sarah', track: null, likes: 45, comments: 8, time: '4h ago' },
    { id: 3, user: 'Marcus', action: 'is listening to', target: 'Space Song - Beach House', avatar: 'https://i.pravatar.cc/150?u=marcus', track: 'Space Song - Beach House', likes: 8, comments: 1, time: '5h ago' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-8 px-6 md:px-10 pb-24"
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-pink-400" />
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Connect through sound</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">Community</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <img src={post.avatar} alt={post.user} className="w-12 h-12 rounded-full border border-white/10" />
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-bold text-white">{post.user}</span> {post.action} <span className="font-bold text-emerald-400">{post.target}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{post.time}</p>
              </div>
            </div>
            
            {post.track && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-4 group cursor-pointer hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </div>
                  <span className="text-sm font-medium text-white">{post.track}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/[0.05]">
              <button className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm">
                <Heart size={16} /> {post.likes}
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm">
                <MessageCircle size={16} /> {post.comments}
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm ml-auto">
                <Share2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Community;
