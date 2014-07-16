var should = require('should');

var memdb = require('../memdb');

// Helper to add a bunch of refs to the db.
function addRefs(db, refs, callback) {
	if (refs.length === 0) {
		return callback();
	}

	var first = refs[0];
	var rest = refs.slice(1);
	db.set(first, 'a874178823acbf493d12f44fc6aac5b3869903f1\n', function(err) {
		if (err) {
			return callback(err);
		}

		addRefs(db, rest, callback);
	});
}

function initWithRefs(refs, callback) {
	var db = memdb();
	db.init(function(err) {
		if (err) {
			return callback(err);
		}

		addRefs(db, refs, function(err) {
			if (err) {
				return callback(err);
			}

			return callback(null, db);
		});
	});
}

describe('memdb', function() {
	it('correctly handle refs', function(done) {
		initWithRefs([
			'refs/heads/master'
			],
			function(err, db) {
				if (err) {
					return done(err);
				}

				db.keys('refs', function(err, refs) {
					if (err) {
						return done(err);
					}
					refs.should.eql(['heads']);
					done();
				});
			}
		);
	});

	it('correctly handle refs with same prefix', function(done) {
		initWithRefs([
			'refs/heads/master',
			'refs/heads/old'
			],
			function(err, db) {
				if (err) {
					return done(err);
				}

				db.keys('refs', function(err, refs) {
					if (err) {
						return done(err);
					}
					refs.should.eql(['heads']);
					done();
				});
			}
		);
	});

	it('correctly handle refs with different prefixes', function(done) {
		initWithRefs([
			'refs/heads/master',
			'refs/tags/v1.0.0'
			],
			function(err, db) {
				if (err) {
					return done(err);
				}

				db.keys('refs', function(err, refs) {
					if (err) {
						return done(err);
					}
					refs.should.eql(['heads', 'tags']);
					done();
				});
			}
		);
	});

	it('correctly handle refs with a trailing slash', function(done) {
		initWithRefs([
			'refs/heads/master',
			'refs/tags/v1.0.0'
			],
			function(err, db) {
				if (err) {
					return done(err);
				}

				db.keys('refs/', function(err, refs) {
					if (err) {
						return done(err);
					}
					refs.should.eql(['heads', 'tags']);
					done();
				});
			}
		);
	});

	it('correctly handle sub-refs with a trailing slash', function(done) {
		initWithRefs([
			'refs/heads/master',
			'refs/heads/feature/test1',
			'refs/heads/feature/test2',
			'refs/tags/v1.0.0'
			],
			function(err, db) {
				if (err) {
					return done(err);
				}

				db.keys('refs/heads', function(err, refs) {
					if (err) {
						return done(err);
					}
					refs.should.eql(['feature', 'master']);
					done();
				});
			}
		);
	});

	it('correctly handles refs that are equal', function(done) {
		initWithRefs([
			'refs/heads/master',
			'refs/heads/feature/test1',
			'refs/heads/feature/test2',
			'refs/tags/v1.0.0'
			],
			function(err, db) {
				if (err) {
					return done(err);
				}

				db.keys('refs/heads/master', function(err, refs) {
					if (err) {
						return done(err);
					}

					/* Not sure why, but it's what git-fs-db returns. */
					should.equal(refs, undefined);
					done();
				});
			}
		);
	});

	it('correctly handles refs that are shorter', function(done) {
		initWithRefs([
			'refs/heads/master',
			'refs/heads/feature/test1',
			'refs/heads/feature/test2',
			'refs/tags/v1.0.0'
			],
			function(err, db) {
				if (err) {
					return done(err);
				}

				db.keys('refs/heads/master/other', function(err, refs) {
					if (err) {
						return done(err);
					}

					/* Not sure why, but it's what git-fs-db returns. */
					should.equal(refs, undefined);
					done();
				});
			}
		);
	});
});
