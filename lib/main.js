(function() {
  'use strict';
  /* TAINT consider to use less conflicting name */
  var CND, DRange, INTERLAP, InterLapLib, Interlap, LFT, MAIN, Multimix, PATH, Segment, alert, apply_drange, badge, cast, debug, declare, echo, freeze, help, hex, info, isa, log, rpr, sort_interlap, type_of, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  badge = 'InterLap';

  rpr = CND.rpr;

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  PATH = require('path');

  hex = function(n) {
    return (n.toString(16)).toUpperCase().padStart(4, '0');
  };

  DRange = require('drange');

  //...........................................................................................................
  this.types = new (require('intertype')).Intertype();

  ({isa, validate, declare, cast, type_of} = this.types.export());

  LFT = require('letsfreezethat');

  // { lets
  //   freeze }                = LFT
  freeze = Object.freeze;

  Multimix = require('multimix');

  MAIN = this;

  //===========================================================================================================
  // TYPES
  //-----------------------------------------------------------------------------------------------------------
  declare('interlap', {
    tests: {
      "must be instanceof Interlap": function(x) {
        return x instanceof Interlap;
      }
    },
    casts: {
      list: function(x) {
        return MAIN.as_list(x);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  declare('segment', {
    tests: {
      "must be instanceof Segment": function(x) {
        return x instanceof Segment;
      }
    },
    casts: {
      list: function(x) {
        return MAIN.as_list(x);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  declare('interlap_interlap_as_list', {
    tests: {
      "must be a list": function(x) {
        return this.isa.list(x);
      },
      "each element must be an interlap_segment_as_list": function(x) {
        return x.every((y) => {
          return this.isa.interlap_segment_as_list(y);
        });
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  declare('interlap_segment_as_list', {
    tests: {
      "must be a list": function(x) {
        return this.isa.list(x);
      },
      "length must be 2": function(x) {
        return x.length === 2;
      },
      "lo boundary must be an infloat": function(x) {
        return isa.infloat(x[0]);
      },
      "hi boundary must be an infloat": function(x) {
        return isa.infloat(x[1]);
      },
      "lo boundary must be less than or equal to hi boundary": function(x) {
        return x[0] <= x[1];
      }
    }
  });

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  Segment = class Segment extends Array {
    //---------------------------------------------------------------------------------------------------------
    constructor(lohi) {
      if (lohi) {
        validate.interlap_segment_as_list(lohi);
      }
      super(lohi[0], lohi[1]);
      Object.defineProperty(this, 'size', {
        get: this._size_of
      });
      Object.defineProperty(this, 'lo', {
        get: function() {
          return this[0];
        }
      });
      Object.defineProperty(this, 'hi', {
        get: function() {
          return this[1];
        }
      });
      return freeze(this);
    }

    //---------------------------------------------------------------------------------------------------------
    _size_of() {
      return this[1] - this[0] + 1;
    }

    // @from:    ( P...  ) -> new Segment P...
    static from() {
      throw new Error("^7324^ `Segment.from()` is not implemented");
    }

  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  Interlap = class Interlap extends Array {
    //---------------------------------------------------------------------------------------------------------
    constructor(segments) {
      var arity, drange, i, len, segment, type;
      super();
      Object.defineProperty(this, 'size', {
        get: this._size_of
      });
      Object.defineProperty(this, 'lo', {
        get: function() {
          var ref, ref1;
          return (ref = (ref1 = this.first) != null ? ref1[0] : void 0) != null ? ref : null;
        }
      });
      Object.defineProperty(this, 'hi', {
        get: function() {
          var ref, ref1;
          return (ref = (ref1 = this.last) != null ? ref1[1] : void 0) != null ? ref : null;
        }
      });
      Object.defineProperty(this, 'first', {
        get: function() {
          var ref;
          return (ref = this[0]) != null ? ref : null;
        }
      });
      Object.defineProperty(this, 'last', {
        get: function() {
          var ref;
          return (ref = this[this.length - 1]) != null ? ref : null;
        }
      });
      Object.defineProperty(this, '_drange', {
        get: function() {
          return drange;
        }
      });
      if ((arity = arguments.length) === 0) {
        //.......................................................................................................
        return apply_drange(this, new DRange());
      }
      if (arity !== 1) {
        throw new Error(`^7326^ expected 1 argument, got ${arity}`);
      }
      if (segments instanceof DRange) {
        return apply_drange(this, drange = segments);
      }
      //.......................................................................................................
      switch (type = type_of(segments)) {
        //.....................................................................................................
        case 'interlap':
          drange = segments._drange;
          break;
        //.....................................................................................................
        case 'segment':
          drange = new DRange();
          drange.add(...segments);
          break;
        // #.....................................................................................................
        // when 'float'
        //   drange = new DRange segments, segments
        //.....................................................................................................
        case 'list':
          drange = new DRange();
          if (segments.length === 1 && isa.generator(segments[0])) {
            segments = [...segments[0]];
          }
          for (i = 0, len = segments.length; i < len; i++) {
            segment = segments[i];
            if (!(segment instanceof Segment)) {
              validate.interlap_segment_as_list(segment);
            }
            drange.add(...segment);
          }
          break;
        default:
          //.....................................................................................................
          throw new Error(`^7325^ unable to instantiate from a ${type_of(segments)} (${rpr(segments)})`);
      }
      //.......................................................................................................
      return apply_drange(this, drange);
    }

    //---------------------------------------------------------------------------------------------------------
    _size_of() {
      return this.reduce((function(sum, segment) {
        return sum + segment.size;
      }), 0);
    }

    static from() {
      throw new Error("^7327^ `Interlap.from()` is not implemented");
    }

  };

  // @from:  -> ( P...  ) -> MAIN.interlap_from_segments P...
  // @from:    ( P...  ) -> new Interlap P...

  //-----------------------------------------------------------------------------------------------------------
  apply_drange = function(me, drange) {
    var i, len, r, segment, segments;
    segments = sort_interlap((function() {
      var i, len, ref, results;
      ref = drange.ranges;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        r = ref[i];
        results.push(new Segment([r.low, r.high]));
      }
      return results;
    })());
/* TAINT use `splice()` */
    for (i = 0, len = segments.length; i < len; i++) {
      segment = segments[i];
      me.push(segment);
    }
    return freeze(me);
  };

  //-----------------------------------------------------------------------------------------------------------
  sort_interlap = function(interlap) {
    return interlap.sort(function(a, b) {
      if (a[0] < b[0]) {
        /* NOTE correct but only the first two terms are ever needed */
        return -1;
      }
      if (a[0] > b[0]) {
        return +1;
      }
      if (a[1] < b[1]) {
        /* could raise an internal error if we get here since the above two comparsions must always suffice */
        return -1;
      }
      if (a[1] > b[1]) {
        return +1;
      }
      return 0;
    });
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.segment_from_lohi = function(lo, hi) {
    return new Segment(hi != null ? [lo, hi] : [lo]);
  };

  this.interlap_from_segments = function(...segments) {
    return new Interlap(segments);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.as_list = function(me) {
    var s, type;
    switch ((type = type_of(me))) {
      case 'segment':
        return [...me];
      case 'interlap':
        return (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = me.length; i < len; i++) {
            s = me[i];
            results.push([...s]);
          }
          return results;
        })();
    }
    throw new Error(`^7328^ expected a segment or an interlap, got a ${type}`);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.as_numbers = function(me) {
    var ref, ref1, s, type;
    switch ((type = type_of(me))) {
      case 'segment':
        return (function() {
          var results = [];
          for (var i = ref = me.lo, ref1 = me.hi; ref <= ref1 ? i <= ref1 : i >= ref1; ref <= ref1 ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
      case 'interlap':
        return ((function() {
          var i, len, ref2, ref3, results;
          results = [];
          for (i = 0, len = me.length; i < len; i++) {
            s = me[i];
            results.push((function() {
              var results1 = [];
              for (var j = ref2 = s.lo, ref3 = s.hi; ref2 <= ref3 ? j <= ref3 : j >= ref3; ref2 <= ref3 ? j++ : j--){ results1.push(j); }
              return results1;
            }).apply(this));
          }
          return results;
        })()).flat(1);
    }
    throw new Error(`^7329^ expected a segment or an interlap, got a ${type}`);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.includes = function(me, other) {
    var type;
    if (!(me instanceof Interlap)) {
      me = new Interlap(me);
    }
    switch (type = type_of(other)) {
      case 'float':
        return this._includes_float(me, other);
      case 'segment':
        return this._includes_segment(me, other);
      default:
        throw new Error(`^7330^ expected a number, got a ${type}`);
    }
    return false;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._includes_float = function(me, other) {
    /* TAINT can stop iteration as soon as s.lo > other */
    return me.some(function(s) {
      return (s.lo <= other && other <= s.hi);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this._includes_segment = function(me, other) {
    /* TAINT can stop iteration as soon as s.lo > other */
    return me.some(function(s) {
      var ref, ref1;
      return ((s.lo <= (ref = other.lo) && ref <= s.hi)) && ((s.lo <= (ref1 = other.hi) && ref1 <= s.hi));
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.union = function(me, ...others) {
    var drange, i, j, len, len1, other, segment;
    if (!(me instanceof Interlap)) {
      me = new Interlap(me);
    }
    drange = me._drange;
    for (i = 0, len = others.length; i < len; i++) {
      other = others[i];
      if (other instanceof Interlap) {
        for (j = 0, len1 = other.length; j < len1; j++) {
          segment = other[j];
          drange = drange.add(...segment);
        }
      } else {
        if (!(other instanceof Segment)) {
          other = new Segment(other);
        }
        drange = drange.add(...other);
      }
    }
    return new Interlap(drange);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.difference = function(me, ...others) {
    var drange, i, j, len, len1, other, segment;
    if (!(me instanceof Interlap)) {
      me = new Interlap(me);
    }
    drange = me._drange;
    for (i = 0, len = others.length; i < len; i++) {
      other = others[i];
      if (other instanceof Interlap) {
        for (j = 0, len1 = other.length; j < len1; j++) {
          segment = other[j];
          drange = drange.subtract(...segment);
        }
      } else {
        if (!(other instanceof Segment)) {
          other = new Segment(other);
        }
        drange = drange.subtract(...other);
      }
    }
    return new Interlap(drange);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.intersection = function(me, ...others) {
    throw new Error("^7331^ not implemented");
  };

  // me._drange.intersect()

  //-----------------------------------------------------------------------------------------------------------
  this.as_unicode_range = function(me, ...P) {
    var method, method_name, type;
    type = type_of(me);
    method_name = `${type}_as_unicode_range`;
    if ((method = this[method_name]) == null) {
      throw new Error(`^4445^ no method named ${rpr(method_name)}`);
    }
    return method.call(this, me, ...P);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.segment_as_unicode_range = function(me) {
    var hi, lo;
    validate.segment(me);
    lo = (me.lo.toString(16)).padStart(4, '0');
    hi = (me.hi.toString(16)).padStart(4, '0');
    return `U+${lo}-U+${hi}`;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.interlap_as_unicode_range = function(me, joiner = ',') {
    var s;
    validate.interlap(me);
    validate.text(joiner);
    return ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = me.length; i < len; i++) {
        s = me[i];
        results.push(this.segment_as_unicode_range(s));
      }
      return results;
    }).call(this)).join(',');
  };

  //###########################################################################################################
  this.Interlap = Interlap;

  this.Segment = Segment;

  InterLapLib = (function() {
    class InterLapLib extends Multimix {};

    InterLapLib.include(MAIN, {
      overwrite: false
    });

    return InterLapLib;

  }).call(this);

  module.exports = INTERLAP = new InterLapLib();

}).call(this);

//# sourceMappingURL=main.js.map