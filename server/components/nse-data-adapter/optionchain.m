https://nse-india.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?segmentLink=17&instrument=OPTSTK&symbol=RELIANCE&date=31AUG2017l

let GetOptionChain=(SYMBOL) =>
let
    Source = Web.Page(Web.Contents("http://nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp?symbol="&Text.Replace(SYMBOL,"&","%26") & "&instrument=OPTSTK&date="&GetCellValues("EXPMONTH"))),
    Data0 = Source{0}[Data],
    #"Filtered Rows3" = Table.SelectRows(#"Data0", each ([CALLS Chart] <> "No contracts traded today")),

    #"Changed Type" = Table.TransformColumnTypes(#"Filtered Rows3",{{"CALLS Chart", type text}, {"CALLS OI", type text}, {"CALLS Chng in OI", type text}, {"CALLS Volume", type text}, {"CALLS IV", type text}, {"CALLS LTP", type text}, {"CALLS Net Chng", type text}, {"CALLS Bid Qty", type text}, {"CALLS Bid Price", type text}, {"CALLS Ask Price", type text}, {"CALLS Ask Qty", type text}, {"Strike Price", Int64.Type}, {"PUTS Bid Qty", type text}, {"PUTS Bid Price", type text}, {"PUTS Ask Price", type text}, {"PUTS Ask Qty", type text}, {"PUTS Net Chng", type text}, {"PUTS LTP", type text}, {"PUTS IV", type text}, {"PUTS Volume", type text}, {"PUTS Chng in OI", type text}, {"PUTS OI", type text}, {"PUTS Chart", type text}}),
    #"Replaced Value" = Table.ReplaceValue(#"Changed Type","-",null,Replacer.ReplaceValue,{"CALLS OI", "CALLS Chng in OI", "CALLS Volume", "CALLS IV", "CALLS LTP", "CALLS Net Chng", "CALLS Bid Qty", "CALLS Bid Price", "CALLS Ask Price", "CALLS Ask Qty", "Strike Price", "PUTS Bid Qty", "PUTS Bid Price", "PUTS Ask Price", "PUTS Ask Qty", "PUTS Net Chng", "PUTS LTP", "PUTS IV", "PUTS Volume", "PUTS Chng in OI", "PUTS OI"}),
	#"Replaced Value1" = Table.ReplaceValue(#"Replaced Value",null,0,Replacer.ReplaceValue,{"CALLS OI", "CALLS Chng in OI", "CALLS Volume", "CALLS IV", "CALLS LTP", "CALLS Bid Qty", "CALLS Bid Price", "CALLS Ask Price", "CALLS Ask Qty", "PUTS Bid Qty", "PUTS Bid Price", "PUTS Ask Price", "PUTS Ask Qty", "PUTS LTP", "PUTS IV", "PUTS Volume", "PUTS Chng in OI", "PUTS OI"}),

    #"Changed Type1" = Table.TransformColumnTypes(#"Replaced Value1",{{"CALLS OI", type number}, {"CALLS Chng in OI", type number}, {"CALLS Volume", type number}, {"CALLS IV", type number}, {"CALLS LTP", type number}, {"CALLS Net Chng", type number}, {"CALLS Bid Qty", type number}, {"CALLS Bid Price", type number}, {"CALLS Ask Price", type number}, {"CALLS Ask Qty", type number}, {"Strike Price", type number}, {"PUTS Bid Qty", type number}, {"PUTS Bid Price", type number}, {"PUTS Ask Price", type number}, {"PUTS Ask Qty", type number}, {"PUTS Net Chng", type number}, {"PUTS LTP", type number}, {"PUTS IV", type number}, {"PUTS Volume", type number}, {"PUTS Chng in OI", type number}, {"PUTS OI", type number}}),
    #"Removed Columns" = Table.RemoveColumns(#"Changed Type1",{"CALLS Chart", "PUTS Chart"}),

    #"Added Custom" = Table.AddColumn(#"Removed Columns", "TotalOI", each [CALLS OI] + [PUTS OI]),
    #"Filtered Rows0" = Table.SelectRows(#"Added Custom", each ([Strike Price] <> null)),
    #"Filtered Rows" = Table.SelectRows(#"Filtered Rows0", each ([TotalOI] > 0)),
    #"Added Custom1" = Table.AddColumn(#"Filtered Rows", "Total Volume", each [CALLS Volume]+[PUTS Volume]),
    #"Filtered Rows1" = Table.SelectRows(#"Added Custom1", each ([Total Volume] > 0)),
    #"Added Custom2" = Table.AddColumn(#"Filtered Rows1", "NetPrice", each (
(
((([CALLS Bid Price]+[CALLS Ask Price])/2)*[CALLS Volume])
+
((([PUTS Bid Price]+[PUTS Ask Price])/2)*[PUTS Volume]))


/([Total Volume]))),
    #"Rounded Off" = Table.TransformColumns(#"Added Custom2",{{"NetPrice", each Number.Round(_, 2), type number}}),
    #"Reordered Columns" = Table.ReorderColumns(#"Rounded Off",{"Strike Price", "TotalOI", "Total Volume", "NetPrice", "CALLS OI", "CALLS Chng in OI", "CALLS Volume", "CALLS IV", "CALLS LTP", "CALLS Net Chng", "CALLS Bid Qty", "CALLS Bid Price", "CALLS Ask Price", "CALLS Ask Qty", "PUTS Bid Qty", "PUTS Bid Price", "PUTS Ask Price", "PUTS Ask Qty", "PUTS Net Chng", "PUTS LTP", "PUTS IV", "PUTS Volume", "PUTS Chng in OI", "PUTS OI"}),
    #"Sorted Rows" = Table.Sort(#"Reordered Columns",{{"Total Volume", Order.Descending}})
in
    #"Sorted Rows"
in
    GetOptionChain


    let GetNTMCallOption=(SYMBOL as text,SP as number) =>
let
    #"Filtered Rows" = Table.SelectRows( GetOptionChains(SYMBOL), each [Strike Price] >= SP),
    #"Sorted Rows" = Table.Sort(#"Filtered Rows",{{"Strike Price", Order.Ascending}}),
    #"Kept First Rows" = Table.FirstN(#"Sorted Rows",1)

in
   #"Kept First Rows"
in
    GetNTMCallOption
