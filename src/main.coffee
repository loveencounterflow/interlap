
'use strict'

############################################################################################################
CND                       = require 'cnd'
badge                     = 'InterLap'
rpr                       = CND.rpr
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
PATH                      = require 'path'
hex                       = ( n ) -> ( n.toString 16 ).toUpperCase().padStart 4, '0'
DRange                    = require 'drange'
#...........................................................................................................
@types                    = new ( require 'intertype' ).Intertype()
{ isa
  validate
  declare
  cast
  type_of }               = @types.export()
LFT                       = require 'letsfreezethat'
# { lets
#   freeze }                = LFT
freeze                    = Object.freeze
Multimix                  = require 'multimix'
MAIN                      = @


#===========================================================================================================
# TYPES
#-----------------------------------------------------------------------------------------------------------
declare 'interlap',
  tests:
    "must be instanceof Interlap": ( x ) -> x instanceof Interlap
  casts:
    list: ( x ) -> MAIN.as_list x

#-----------------------------------------------------------------------------------------------------------
declare 'segment',
  tests:
    "must be instanceof Segment": ( x ) -> x instanceof Segment
  casts:
    list: ( x ) -> MAIN.as_list x

#-----------------------------------------------------------------------------------------------------------
declare 'interlap_interlap_as_list', tests:
  "must be a list":                                   ( x ) -> @isa.list x
  "each element must be an interlap_segment_as_list": ( x ) -> x.every ( y ) => @isa.interlap_segment_as_list y

#-----------------------------------------------------------------------------------------------------------
declare 'interlap_segment_as_list', tests:
  "must be a list":                                         ( x ) -> @isa.list x
  "length must be 2":                                       ( x ) -> x.length is 2
  "lo boundary must be an infnumber":                       ( x ) -> isa.infnumber x[ 0 ]
  "hi boundary must be an infnumber":                       ( x ) -> isa.infnumber x[ 1 ]
  "lo boundary must be less than or equal to hi boundary":  ( x ) -> x[ 0 ] <= x[ 1 ]


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
class Segment extends Array

  #---------------------------------------------------------------------------------------------------------
  constructor: ( lohi ) ->
    validate.interlap_segment_as_list lohi if lohi
    super lohi[ 0 ], lohi[ 1 ]
    Object.defineProperty @, 'size',  get: @_size_of
    Object.defineProperty @, 'lo',    get: -> @[ 0 ]
    Object.defineProperty @, 'hi',    get: -> @[ 1 ]
    return freeze @

  #---------------------------------------------------------------------------------------------------------
  _size_of:           -> @[ 1 ] - @[ 0 ] + 1
  # @from:    ( P...  ) -> new Segment P...
  @from:  -> throw new Error "^778^ `Segment.from()` is not implemented"


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
class Interlap  extends Array

  #---------------------------------------------------------------------------------------------------------
  constructor: ( segments ) ->
    super()
    Object.defineProperty @, 'size',    get: @_size_of
    Object.defineProperty @, 'lo',      get: -> @first?[ 0      ] ? null
    Object.defineProperty @, 'hi',      get: -> @last?[  1      ] ? null
    Object.defineProperty @, 'first',   get: -> @[ 0            ] ? null
    Object.defineProperty @, 'last',    get: -> @[ @length - 1  ] ? null
    Object.defineProperty @, '_drange', get: -> drange
    #.......................................................................................................
    if segments instanceof DRange
      drange    = segments
    else if segments instanceof Interlap
      drange    = segments._drange
    else if Array.isArray segments
      drange    = new DRange()
      segments  = [ segments[ 0 ]..., ] if segments.length is 1 and isa.generator segments[ 0 ]
      for segment in segments
        validate.interlap_segment_as_list segment unless segment instanceof Segment
        drange.add segment...
    else
      throw new Error "^445^ unable to instantiate from a #{type_of segments} (#{rpr segments})"
    #.......................................................................................................
    MAIN._apply_segments_from_drange @, drange
    return freeze @

  #---------------------------------------------------------------------------------------------------------
  _size_of:           -> @reduce ( ( sum, segment ) -> sum + segment.size ), 0
  @from:  -> throw new Error "^776^ `Interlap.from()` is not implemented"
  # @from:  -> ( P...  ) -> MAIN.interlap_from_segments P...
  # @from:    ( P...  ) -> new Interlap P...


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@segment_from_lohi      = ( lo, hi      ) -> new Segment if hi? then [ lo, hi, ] else [ lo, ]
@interlap_from_segments = ( segments... ) -> new Interlap segments

#-----------------------------------------------------------------------------------------------------------
@as_list = ( me ) ->
  switch ( type = type_of me )
    when 'segment'  then return [ me..., ]
    when 'interlap' then return ( [ s..., ] for s in me )
  throw new Error "^3445^ expected a segment or an interlap, got a #{type}"

#-----------------------------------------------------------------------------------------------------------
@union = ( me, others... ) ->
  me      = new Interlap me unless me instanceof Interlap
  drange  = me._drange
  drange  = drange.add segment... for segment in me
  for other in others
    if other instanceof Interlap
      drange = drange.add segment... for segment in other
    else
      other   = new Segment other unless other instanceof Segment
      drange  = drange.add other...
  return new Interlap drange

# #-----------------------------------------------------------------------------------------------------------
# @_drange_as_interlap  = ( drange ) ->
#   return freeze @_sort Interlap.from ( ( new Segment [ r.low, r.high, ] ) for r in drange.ranges )

#-----------------------------------------------------------------------------------------------------------
@_sort = ( interlap ) -> interlap.sort ( a, b ) ->
  ### NOTE correct but only the first two terms are ever needed ###
  return -1 if a[ 0 ] < b[ 0 ]
  return +1 if a[ 0 ] > b[ 0 ]
  ### could raise an internal error if we get here since the above two comparsions must always suffice ###
  return -1 if a[ 1 ] < b[ 1 ]
  return +1 if a[ 1 ] > b[ 1 ]
  return  0

#-----------------------------------------------------------------------------------------------------------
@_apply_segments_from_drange = ( me, drange ) ->
  segments = MAIN._sort ( ( new Segment [ r.low, r.high, ] ) for r in drange.ranges )
  me.push segment for segment in segments ### TAINT use `splice()` ###
  return me


############################################################################################################
@Interlap   = Interlap
@Segment    = Segment

### TAINT consider to use less conflicting name ###
class InterLapLib extends Multimix
  @include MAIN, { overwrite: false, }

module.exports = INTERLAP = new InterLapLib()



