describe("ARQueryable", function() {
  beforeEach(function() {
    backend.whenGET("https://api.edmodo.com/posts.json?author_id=1&page=1")
      .respond(200, [{id: 1, title: "My Great Post", author_id: 1},
                {id: 2, title: "Joan of Shark", author_id: 1}], {});

    backend.whenGET("https://api.edmodo.com/posts.json?page=1")
      .respond(200, [{id: 1, title: "My Great Post", author_id: 1},
                {id: 2, title: "Joan of Shark", author_id: 1}], {});

    backend.whenGET("https://api.edmodo.com/posts.json?author_id=1&page=2&per_page=5")
      .respond(200, [{id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}],
        {'Link': 
         '<https://api.edmodo.com/posts.json?author_id=1&page=1&per_page=5>; rel="previous", <https://api.edmodo.com/posts.json?author_id=1&page=3&per_page=5; rel="next"'});

    spyOn($http, "get").andCallThrough();

  });

  it("finds multiple instances via query", function() {
    var posts = Post.where({author_id: 1});
    backend.flush();

    expect(posts.first().id).toEqual(1);
  });

  it("watches collections queried for", function() {
    var posts = Post.where({author_id: 1});
    backend.flush();

    expect(Post.watchedCollections).toContain(posts);
  });

  it("uses findAll as an alias for where with no options", function() {
    var posts = Post.findAll();
    backend.flush();

    expect(posts.length).toEqual(2);
  });

  it("transforms the json into model instances", function() {
    var posts = Post.where({author_id: 1});
    backend.flush();

    expect(posts.first().constructor).toEqual(Post);
  });

  it("grabs associations", function() {
    var author = Author.new({id: 1, name: "Jane Austen"});
    var posts  = Post.where({author_id: 1});

    backend.flush();

    posts.each(function(post) {
      expect(post.author).toEqual(author);
    });
  });

  it("caches query objects", function() {
    var posts = Post.where({author_id: 1, page: 2, per_page: 5});
    backend.flush();

    expect(posts.queries.find({author_id: 1, page: 2, per_page: 5}).objects.pluck("id"))
      .toEqual(posts.pluck("id"));
  });

  it("caches query responses", function() {
    var posts = Post.where({author_id: 1, page: 2, per_page: 5});
    backend.flush();

    expect(posts.queries.find({author_id: 1, page: 2, per_page: 5}).headers.link.next.params)
      .toEqual({
        author_id: 1,
        page: 3,
        per_page: 5
      });
  });

  it("does not query with empty params", function() {
    var posts = Post.where({author_id: 1, query: ""});
    backend.flush();

    expect($http.get.mostRecentCall.args[1].params).toEqual({author_id: 1, page: 1});
  });
});
