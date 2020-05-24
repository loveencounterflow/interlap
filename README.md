


# InterLap: Discontinuous Ranges

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Data Structures](#data-structures)
- [Coding Principles](#coding-principles)
- [Related](#related)

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

* Classes, instances are largely 'passive'
* interesting methods all in stateless library with pure functions
* shallow extensions of standard types (`Array` in this case)
* therefore can always be replaced w/ standard objects
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

<!--

does it make sense to allow
* codepoints as strings
* arbitrary strings? strings do have a total ordering, so why not? but probably no use case, so rather
	use strings for single codepoints only




 -->

