    let
    Source = Json.Document(Web.Contents("http://www.nseindia.com/live_market/dynaContent/live_watch/stock_watch/foSecStockWatch.json")),
    data = Source[data],
    #"Converted to Table" = Table.FromList(data, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    #"Expanded Column1" = Table.ExpandRecordColumn(#"Converted to Table", "Column1",
	{"symbol", "open", "high", "low", "ltP", "ptsC", "per", "trdVol", "trdVolM", "ntP", "mVal", "wkhi", "wklo", "wkhicm_adj", "wklocm_adj", "xDt", "cAct", "yPC", "mPC"},
	{"symbol", "open", "high", "low", "LTP", "Change", "perChange", "VolumeLacs", "trdVolM", "TurnoverCrores", "mVal", "52wkH", "52wkL", "wkhicm_adj", "wklocm_adj", "xDt", "CorpAction", "perChange365", "perChange30"}),
    #"Changed Type" = Table.TransformColumnTypes(#"Expanded Column1",{{"open", Currency.Type}, {"high", Currency.Type}, {"low", Currency.Type}, {"LTP", Currency.Type}, {"Change", Currency.Type}, {"52wkH", Currency.Type}, {"52wkL", Currency.Type}, {"perChange", type number}, {"VolumeLacs", type number}, {"trdVolM", type number}, {"perChange365", type number}, {"perChange30", type number}, {"TurnoverCrores", Currency.Type}}),
    #"Renamed Columns" = Table.RenameColumns(#"Changed Type",{{"perChange365", "per Change 365"}, {"perChange30", "per Change 30"}, {"perChange", "per Change"}}),
    #"Filtered Rows" = Table.SelectRows(#"Renamed Columns", each ([symbol] <> "M&M" and [symbol] <> "M1M")),
    #"Filtered Rows2" = Table.SelectRows(#"Filtered Rows", each [VolumeLacs] > 10),
    NTMCall = Table.AddColumn(#"Filtered Rows2", "NTM Call", each GetNTMCallOption([symbol],[LTP])),
    #"Expanded NTM Call" = Table.ExpandTableColumn(NTMCall, "NTM Call", {"Strike Price", "TotalOI", "Total Volume", "NetPrice", "CALLS OI", "CALLS Volume", "CALLS IV", "CALLS LTP", "CALLS Bid Qty", "CALLS Bid Price", "CALLS Ask Price", "CALLS Ask Qty"}, {"NTM Call.Strike Price", "NTM Call.TotalOI", "NTM Call.Total Volume", "NTM Call.NetPrice", "NTM Call.CALLS OI", "NTM Call.CALLS Volume", "NTM Call.CALLS IV", "NTM Call.CALLS LTP", "NTM Call.CALLS Bid Qty", "NTM Call.CALLS Bid Price", "NTM Call.CALLS Ask Price", "NTM Call.CALLS Ask Qty"}),
    #"Added Custom" = Table.AddColumn(#"Expanded NTM Call", "NTMPut",  each GetNTMPutOption([symbol],[LTP])),
    #"Expanded NTM Put" = Table.ExpandTableColumn(#"Added Custom", "NTMPut", {"Strike Price", "TotalOI", "Total Volume", "NetPrice", "PUTS Bid Qty", "PUTS Bid Price", "PUTS Ask Price", "PUTS Ask Qty", "PUTS LTP", "PUTS IV", "PUTS Volume", "PUTS OI"}, {"NTMPut.Strike Price", "NTMPut.TotalOI", "NTMPut.Total Volume", "NTMPut.NetPrice", "NTMPut.PUTS Bid Qty", "NTMPut.PUTS Bid Price", "NTMPut.PUTS Ask Price", "NTMPut.PUTS Ask Qty", "NTMPut.PUTS LTP", "NTMPut.PUTS IV", "NTMPut.PUTS Volume", "NTMPut.PUTS OI"}),
    #"Added Custom1" = Table.AddColumn(#"Expanded NTM Put", "Call Mid Price", each ([NTM Call.CALLS Bid Price] + [NTM Call.CALLS Ask Price])/2),
    #"Added Custom2" = Table.AddColumn(#"Added Custom1", "Put Mid Price", each ([NTMPut.PUTS Bid Price] + [NTMPut.PUTS Ask Price])/2),
    #"Changed Type1" = Table.TransformColumnTypes(#"Added Custom2",{{"Call Mid Price", Currency.Type}, {"Put Mid Price", Currency.Type}, {"LTP", Int64.Type}}),
    #"Replaced Errors" = Table.ReplaceErrorValues(#"Changed Type1", {{"per Change 365", null}}),
    #"Replaced Errors1" = Table.ReplaceErrorValues(#"Replaced Errors", {{"per Change 30", null}}),
    #"Filtered Rows1" = Table.SelectRows(#"Replaced Errors1", each ([NTM Call.Strike Price] <> null))
in
    #"Filtered Rows1"