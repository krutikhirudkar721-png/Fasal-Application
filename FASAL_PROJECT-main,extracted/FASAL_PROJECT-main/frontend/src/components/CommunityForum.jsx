import React, { useState, useEffect } from 'react';
import { STR } from '../data/i18n';
import { api } from '../data/api';

export default function CommunityForum({ lang, user, onOpenAuth }) {
  const t = STR[lang] || STR.en;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [activeReplyPostId, setActiveReplyPostId] = useState(null);

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCrop, setNewCrop] = useState('Soybean');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const crops = [
    'all', 'Soybean', 'Cotton', 'Wheat', 'Chickpea', 'Turmeric', 'Sugarcane'
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getCommunityPosts(selectedCrop);
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to fetch community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCrop]);

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newTitle.trim() || !newBody.trim()) {
      setError(lang === 'hi' ? 'कृपया शीर्षक और विवरण भरें।' : lang === 'mr' ? 'कृपया शीर्षक आणि माहिती भरा.' : 'Please enter title and post details.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await api.createCommunityPost({
        title: newTitle.trim(),
        body: newBody.trim(),
        crop: newCrop,
      });
      setNewTitle('');
      setNewBody('');
      setIsCreatingPost(false);
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (postId) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!replyText.trim()) return;

    try {
      await api.replyCommunityPost(postId, { body: replyText.trim() });
      setReplyText('');
      setActiveReplyPostId(null);
      fetchPosts();
    } catch (err) {
      alert(err.message || 'Failed to submit reply');
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.likeCommunityPost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: res.likes } : p));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  return (
    <section id="community" className="section">
      <div className="container">
        <div className="section-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="live-dot"></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {lang === 'hi' ? 'किसान समुदाय व चर्चा मंच' : lang === 'mr' ? 'शेतकरी समुदाय व चर्चा मंच' : 'Farmer Community & Knowledge Exchange'}
            </span>
          </div>
          <h2 className="gradient-text">
            {lang === 'hi' ? 'किसान चौपाल' : lang === 'mr' ? 'शेतकरी मंच' : 'Farmer Community Hub'}
          </h2>
          <p>
            {lang === 'hi'
              ? 'अनुभवी किसानों से फसल अनुभव, पैदावार और कीट प्रबंधन पर प्रश्न पूछें और साझा करें।'
              : lang === 'mr'
              ? 'अनुभवी शेतकऱ्यांकडून पीक व्यवस्थापन, उत्पादन आणि कीड नियंत्रणावर सल्ला घ्या व चर्चा करा.'
              : 'Real insights, crop yields, and disease remedies shared by peer farmers across India.'}
          </p>
        </div>

        {/* Filter bar + New Post Trigger */}
        <div
          className="glass-card no-hover"
          style={{
            marginBottom: '2rem',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Crop tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {crops.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                style={{
                  background: selectedCrop === c ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                  color: selectedCrop === c ? '#000' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: selectedCrop === c ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {c === 'all' ? (lang === 'hi' ? 'सभी फसलें' : lang === 'mr' ? 'सर्व पिके' : 'All Crops') : c}
              </button>
            ))}
          </div>

          {/* New Post Button */}
          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else setIsCreatingPost(true);
            }}
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
          >
            ✍️ {lang === 'hi' ? 'नया प्रश्न / अनुभव साझा करें' : lang === 'mr' ? 'नवीन प्रश्न / अनुभव शेअर करा' : 'Ask the Community'}
          </button>
        </div>

        {/* Create Post Form */}
        {isCreatingPost && (
          <div
            className="glass-card animate-slide-up"
            style={{
              marginBottom: '2rem',
              padding: '1.75rem',
              background: 'rgba(10, 25, 45, 0.9)',
              border: '1px solid var(--accent-emerald)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--accent-gold)' }}>
                {lang === 'hi' ? 'समुदाय में नया प्रश्न पूछें' : lang === 'mr' ? 'समुदायात नवीन प्रश्न विचारा' : 'Start a Discussion'}
              </h3>
              <button
                onClick={() => setIsCreatingPost(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {error && <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleCreatePostSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">{lang === 'hi' ? 'चर्चा का शीर्षक' : lang === 'mr' ? 'चर्चेचे शीर्षक' : 'Topic / Question Title'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sowing spacing for Soybean on raised beds"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">{lang === 'hi' ? 'फसल' : lang === 'mr' ? 'पीक' : 'Target Crop'}</label>
                  <select
                    className="form-input"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    style={{ background: '#0a1628' }}
                  >
                    {crops.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">{lang === 'hi' ? 'लेखक' : lang === 'mr' ? 'लेखक' : 'Author'}</label>
                  <input
                    type="text"
                    className="form-input"
                    disabled
                    value={`${user?.name || 'Farmer'} (+91 ${user?.phone || '••••••'})`}
                    style={{ opacity: 0.7 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">{lang === 'hi' ? 'विवरण' : lang === 'mr' ? 'तपशील' : 'Details / Observations'}</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Share details about soil conditions, rainfall, crop variety, or pest observations..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '0.6rem 1.25rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
                >
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(52,211,153,0.15)', borderTopColor: 'var(--accent-emerald)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass-card animate-slide-up"
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1.5rem',
                }}
              >
                {/* Author row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-emerald)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {post.authorName?.[0] || '👨‍🌾'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                        {post.authorName || 'Farmer'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {post.authorDistrict || 'Maharashtra'} · {post.authorPhone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {post.crop && (
                      <span
                        style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          color: 'var(--accent-sky)',
                          borderRadius: '6px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        🌾 {post.crop}
                      </span>
                    )}
                  </div>
                </div>

                {/* Post Title & Body */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {post.body}
                </p>

                {/* Post Footer Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginBottom: post.replies?.length ? '1rem' : 0 }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-secondary)',
                      borderRadius: '6px',
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    👍 <span>{post.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--accent-emerald)',
                      borderRadius: '6px',
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    💬 <span>{post.replies?.length || 0} Replies</span>
                  </button>
                </div>

                {/* Replies Thread */}
                {post.replies && post.replies.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(52,211,153,0.2)' }}>
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-sky)' }}>
                            {reply.authorName || 'Farmer'} ({reply.authorPhone})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {reply.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline reply box */}
                {activeReplyPostId === post.id && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={user ? "Write your reply or advice..." : "Log in to reply..."}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleReplySubmit(post.id);
                      }}
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                    />
                    <button
                      onClick={() => handleReplySubmit(post.id)}
                      className="btn-primary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
