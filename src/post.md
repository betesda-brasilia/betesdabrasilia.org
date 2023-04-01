---
layout: 'layouts/post.njk'
pagination:
  data: blog.posts
  size: 1
  alias: post
permalink: 'blog/post/{{post.title | slugify}}/index.html'
---
