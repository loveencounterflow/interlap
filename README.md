


# InterLap: Discontinuous Ranges

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Data Structures](#data-structures)
- [Coding Principles](#coding-principles)
- [Related](#related)
- [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Data Structures

* `Interlap`, a derivative of JS `Array`
* IOW a list
* whose elements are in turn `Segment`s, another derivative of JS `Array`
* segments are pairs `[ lo, hi, ]` where both are finite or infinite numbers
* invariant `s.lo <= s.hi` always holds for all `s instanceof Segment`
* `s.lo == s.hi` denotes a single point (a segment with `s.size == 1`)

```
[ [ 4, 6 ], [ 7, 7, ], [ 11, 19, ], ]
```

* segments may be merged into an `Interlap` instance in any order using `union()`
* this will return a new `Interlap` instance with the minimum of segments needed to cover all and only the
	points covered by the union of all the segments
* likewise, an `Interlap` instance may be merged with (the segments of) another `Interlap` instance
* the segments of an `Interlap` instance are always ordered:
	* when comparing two segments `a`, `b`, the segments with the lower `lo` comes first
	* in case `a.lo == b.lo`, then the one with the lower `s.hi` comes first
	* in segments of `Interlap` instances it always suffices to compare segments for inequality of their
		lower bounds

* Discontinuous ranges are expressed by `Interlap` instances ('interlaps')
* that contain `Segment` instances
* they are basically just lists (`Array` instances) but
  * validated (segments must be pairs of numbers and so on) and
  * frozen (so validity itself becomes invariant as long as identity holds)
* therefore
  * we can always turn interlaps into lists, and/but
  * we can turn *some* suitably shaped lists into interlaps
  * therefore, although interlaps look like lists and quack like lists, they are not just lists
  * hence, `equals my_list, my_interlap` must always be `false`
  * at best, `equals ( as_list my_interlap ), my_list` can hold

## Coding Principles

*Note*—The below are some points I have been wanting to write down for some time; they are rather about the
implementation pattern used in `interlap/main.coffee` in general rather than `Inteerlap` objects in
particular, though `lasp` and `segments` are used as examples.

* Classes, instances are largely 'passive'
* interesting methods all in stateless library with pure functions
* shallow extensions of standard types (`Array` in this case) **Note** this will probably change in a future
  version; see [To Do](#to-do), below
* <strike>therefore can always be replaced w/ standard objects</strike> conversion from and to standard
  types possible (`segments` can be turned into lists of two elements `[ s.lo, s.hi, ]`; `laps`: can be
  turned into (possibly empty) lists of `segments`)
* observe that *multiple* meaningful and information preserving casts *per target data type* are always
  possible, for example, `new Segment [ 0x4e01, 0x9fff, ]` could be turned into any of `[ 19969, 40943, ]`,
  `{ lo: 19969, hi: 40943, }`, `{ first: 19969, last: 40943, }`, `'U+4e01-U+9fff'`, `/[丁-鿯]/`. There's no
  one true and unique representation, although there may be some preferred form(s) and some forms that are
  only supported by some methods
* in case users should wish to use methods like `[].join()`, `[].map()`, `[].reduce()` and so forth on
  `segments` or `laps`, they should be aware that for all their arrayish listfulness, `segments` and `laps`
  are not lists. From the outset, none of the mutating methods (`[].sort()`, `[].push()`) can be used with
  their usual semantics because `segments` and `laps` are immutable. In the case of `segments`,
  `segment.push()` does not make sense because each segment must always have exactly to elements; that we
  have decided to implemented as elements with indexes `0` and `1` is an implementation detail. In the case
  of `laps`, `lap.push segment` is conceivable and could return a new lap—but that should be no different
  from the output of `LAP.union lap, segemt` and would thus add duplication instead of usefulness to the
  API. Moreover, while `LAP.union()` is a somewhat unfortunate name for a function (since it is a noun, not
  a verb), `lap.push()` is considerably worse (it looks like it could mutate `lap`, which it can't, and it
  sounds like it would takc something to the end of `lap`, which it won't).
* validation by (implicit) instantiation
* instances are immutable (frozen)
* duties of instances:
	* carriers of a few standard attributes (`d.size` in this case)
	* serve as caching mechanism (instances may hold references to objects that implement functionalities)
	* 'being an instance of a class' serves as 'product certification label'; given we allow only valid
	  inputs to build expected structures (and assuming absence of bugs), then—since instances are frozen—we
	  can be sure at any later point in time that a `d` for which `d instanceof D` holds is also valid; there
	  is no change management

## Related

* drange (used to perform range arithmetics)
* [`@scotttrinh/number-ranges`](https://www.npmjs.com/package/@scotttrinh/number-ranges)
* drange-immutable

## To Do

* [ ] implement `intersection()`
* [ ] consider to not base `Segment`, `Interlap` on `Array` (instead, use no particular class or else maybe
  `Multimix`); this would rid the API of all the spurious methods tacked onto what is intended to be pure
  data objects; observe that ` d = new Interlap(); d.push 42` will throw an error *in strict mode* because
  `d` is frozen; other methods might return surprising/meaningless results; manipulation of `laps`,
  `segments` at any rate intended to happen through library functions, not object methods

<!--

does it make sense to allow
* codepoints as strings
* arbitrary strings? strings do have a total ordering, so why not? but probably no use case, so rather
	use strings for single codepoints only
 -->

