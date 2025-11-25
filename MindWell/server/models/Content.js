import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'exercise', 'resource', 'announcement'],
    default: 'article'
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'anxiety',
      'depression',
      'stress',
      'mindfulness',
      'therapy',
      'self-care',
      'crisis',
      'general'
    ]
  },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  media: {
    image: String,
    video: String,
    audio: String,
    attachments: [String]
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: String
  },
  accessLevel: {
    type: String,
    enum: ['public', 'registered', 'premium'],
    default: 'public'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: Date,
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reading time estimation
contentSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Indexes
contentSchema.index({ status: 1, publishedAt: -1 });
contentSchema.index({ category: 1, status: 1 });
contentSchema.index({ author: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ 'seo.slug': 1 }, { unique: true, sparse: true });

// Pre-save middleware to generate slug
contentSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.seo?.slug) {
    this.seo = this.seo || {};
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Content = mongoose.model('Content', contentSchema);

export default Content;
