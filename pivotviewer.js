//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///PivotViewer
var global = {};
var PivotViewer = PivotViewer || {};
PivotViewer.Version="1.1.5-9443f90";
PivotViewer.Models = {};
PivotViewer.Models.Loaders = {};
PivotViewer.Utils = {};
PivotViewer.Views = {};
PivotViewer.Debug = {};
/*	
http://higginsforpresident.net/js/static/jq.pubsub.js
jQuery pub/sub plugin by Peter Higgins (dante@dojotoolkit.org)
Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.
Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
http://dojofoundation.org/license for more information.
*/
; (function (d) {

	// the topic/subscription hash
	var cache = {};

	d.publish = function (/* String */topic, /* Array? */args) {
		// summary: 
		//		Publish some data on a named topic.
		// topic: String
		//		The channel to publish on
		// args: Array?
		//		The data to publish. Each array item is converted into an ordered
		//		arguments on the subscribed functions. 
		//
		// example:
		//		Publish stuff on '/some/topic'. Anything subscribed will be called
		//		with a function signature like: function(a,b,c){ ... }
		//
		//	|		$.publish("/some/topic", ["a","b","c"]);
		cache[topic] && d.each(cache[topic], function () {
			this.apply(d, args || []);
		});
	};

	d.subscribe = function (/* String */topic, /* Function */callback) {
		// summary:
		//		Register a callback on a named topic.
		// topic: String
		//		The channel to subscribe to
		// callback: Function
		//		The handler event. Anytime something is $.publish'ed on a 
		//		subscribed channel, the callback will be called with the
		//		published array as ordered arguments.
		//
		// returns: Array
		//		A handle which can be used to unsubscribe this particular subscription.
		//	
		// example:
		//	|	$.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
		//
		if (!cache[topic]) {
			cache[topic] = [];
		}
		cache[topic].push(callback);
		return [topic, callback]; // Array
	};

	d.unsubscribe = function (/* Array */handle) {
		// summary:
		//		Disconnect a subscribed function for a topic.
		// handle: Array
		//		The return value from a $.subscribe call.
		// example:
		//	|	var handle = $.subscribe("/something", function(){});
		//	|	$.unsubscribe(handle);

		var t = handle[0];
		cache[t] && d.each(cache[t], function (idx) {
			if (this == handle[1]) {
				cache[t].splice(idx, 1);
			}
		});
	};

})(jQuery);//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

PivotViewer.Debug.Log = function (message) {
    if (window.console && window.console.log && typeof debug != "undefined" && debug == true) {
        window.console.log(message);
    }
};

//Gets the next 'frame' from the browser (there are several methods) and controls the frame rate
window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

PivotViewer.Utils.EscapeMetaChars = function (jQuerySelector) {
    //!"#$%&'()*+,./:;<=>?@[\]^`{|}~
    return jQuerySelector
            .replace(/\|/gi, "\\|")
            .replace(/\//gi, "\\/")
            .replace(/'/gi, "\\'")
            .replace(/,/gi, "\\,")
            .replace(/:/gi, "\\:")
            .replace(/\(/gi, "\\(")
            .replace(/\)/gi, "\\)")
            .replace(/\+/gi, "\\+")
            .replace(/\+/gi, "\\-")
            .replace(/\+/gi, "\\_")
            .replace(/\+/gi, "\\%");
};

PivotViewer.Utils.EscapeItemId = function (itemId) {
    return itemId
            .replace(/\s+/gi, "|")
            .replace(/'/gi, "")
            .replace(/\(/gi, "")
            .replace(/\)/gi, "")
            .replace(/\./gi, "");
};

PivotViewer.Utils.HtmlSpecialChars = function (orig) {
    return jQuery('<div />').text(orig).html();
}

PivotViewer.Utils.Now = function () {
    if (Date.now)
        return Date.now();
    else
        return (new Date().getTime());
};

// Provided the minimum number is < 1000000
PivotViewer.Utils.Min = function (values) {
    var min = 1000000;
    for (var i = 0, _iLen = values.length; i < _iLen; i++)
        min = min > values[i] ? values[i] : min;
    return min;
}

// Provided the maximum number is > -1000000
PivotViewer.Utils.Max = function (values) {
    var max = -1000000;
    for (var i = 0, _iLen = values.length; i < _iLen; i++)
        max = max < values[i] ? values[i] : max;
    return max;
}

PivotViewer.Utils.Histogram = function (values) {
    if (!values instanceof Array)
        return null;

    var min = PivotViewer.Utils.Min(values);
    var max = PivotViewer.Utils.Max(values);

    var bins = (Math.floor(Math.pow(2 * values.length, 1 / 3)) + 1) * 2;
    if (bins > 10)
        bins = 10;
    var stepSize = ((max + 1) - (min - 1)) / bins;

    var histogram = [];
    for (var i = 0; i < bins; i++) {
        var minRange = min + (i * stepSize);
        var maxRange = min + ((i + 1) * stepSize);
        histogram.push([]);
        for (var j = 0, _jLen = values.length; j < _jLen; j++) {
            if (minRange <= values[j] && maxRange > values[j])
                histogram[i].push(values[j]);
        }
    }
    return { Histogram: histogram, Min: min, Max: max, BinCount: bins };
};

PivotViewer.Utils.StripVirtcxml = function (value) {
    if (value.startsWith ('virtcxml:Facet'))
      return value.substr(14);
    else 
      return value;
};

// A simple class creation library.
// From Secrets of the JavaScript Ninja
// Inspired by base2 and Prototype
(function () {
    var initializing = false,
    // Determine if functions can be serialized
    fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;

    // Create a new Class that inherits from this class
    Object.subClass = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var proto = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            proto[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function (name, fn) {
            return function () {
                var tmp = this._super;

                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = _super[name];

                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);
                this._super = tmp;

                return ret;
            };
        })(name, prop[name]) :
        prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = proto;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extendable
        Class.subClass = arguments.callee;

        return Class;
    };
})();
//
//  HTML5 PivotViewer
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

PivotViewer.Models.Collection = Object.subClass({
	init: function () {
		var xmlns = "http://schemas.microsoft.com/collection/metadata/2009",
		xmlnsp = "http://schemas.microsoft.com/livelabs/pivot/collection/2009";
		this.CollectionName = "";
		this.BrandImage = "";
		this.FacetCategories = [];
		this.Items = [];
		this.CollectionBase = "";
		this.CollectionBaseNoProxy = "";
		this.ImageBase = "";
                this.CopyrightName = "";
                this.CopyrightHref = "";
                this.MaxRelatedLinks = 0;
	},
	GetItemById: function (Id) {
		for (var i = 0; i < this.Items.length; i++) {
			if (this.Items[i].Id == Id)
				return this.Items[i];
		}
		return null;
	},

	GetFacetCategoryByName: function (categoryName) {
		for (var i = 0; i < this.FacetCategories.length; i++) {
			if (this.FacetCategories[i].Name == categoryName)
				return this.FacetCategories[i];
		}
		return null;
	}
});

//PivotViewer.Models
PivotViewer.Models.FacetCategory = Object.subClass({
	init: function (Name, Format, Type, IsFilterVisible, IsMetaDataVisible, IsWordWheelVisible, CustomSort) {
                this.Name = Name;
		this.Format = Format;
		this.Type = Type != null && Type != undefined ? Type : PivotViewer.Models.FacetType.String;
		this.IsFilterVisible = IsFilterVisible != null && IsFilterVisible != undefined ? IsFilterVisible : true;
		this.IsMetaDataVisible = IsMetaDataVisible != null && IsMetaDataVisible != undefined ? IsMetaDataVisible : true;
		this.IsWordWheelVisible = IsWordWheelVisible != null && IsWordWheelVisible != undefined ? IsWordWheelVisible : true;
		this.CustomSort;
                this.decadeBuckets = [];
                this.yearBuckets = [];
                this.monthBuckets = [];
                this.dayBuckets = [];
                this.hourBuckets = [];
                this.minuteBuckets = [];
                this.secondBuckets = [];
	}
});

PivotViewer.Models.FacetCategorySort = Object.subClass({
	init: function (Name) {
		this.Name = Name;
		this.SortValues = [];
	}
});

PivotViewer.Models.Item = Object.subClass({
	init: function (Img, Id, Href, Name) {
		this.Img = Img,
		this.Id = Id,
		this.Href = Href,
		this.Name = Name,
		this.Description,
		this.Facets = [];
                this.Links = [];
	}
});

PivotViewer.Models.ItemLink = Object.subClass({
	init: function (Name, Href) {
                 this.Name = Name;
                 this.Href = Href;
	}
});

PivotViewer.Models.Facet = Object.subClass({
	init: function (Name, Values) {
		this.Name = Name;
                if (Values === undefined)
		  this.FacetValues = [];
                else
		  this.FacetValues = Values;
	},
	AddFacetValue: function (facetValue) {
		this.FacetValues.push(facetValue);
	}
});

PivotViewer.Models.FacetValue = Object.subClass({
	init: function (Value) {
		this.Value = Value;
		this.Href = "";
	}
});

PivotViewer.Models.DateTimeInfo = Object.subClass({
	init: function (Name, StartDate) {
		this.Name = Name;
                this.StartDate = StartDate;
		this.Items = [];
	}
});

PivotViewer.Models.FacetType = {
	String: "String",
	LongString: "LongString",
	Number: "Number",
	DateTime: "DateTime",
	Link: "Link"
};
//
//  HTML5 PivotViewer
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///  Collection loader interface - used so that different types of data sources can be used
PivotViewer.Models.Loaders.ICollectionLoader = Object.subClass({
    init: function () { },
    LoadCollection: function (collection) {
        if (!collection instanceof PivotViewer.Models.Collection) {
            throw "collection not an instance of PivotViewer.Models.Collection.";
        }
    }
});

//CXML loader
PivotViewer.Models.Loaders.CXMLLoader = PivotViewer.Models.Loaders.ICollectionLoader.subClass({
    init: function (CXMLUri, proxy, allowHosts, allowedHostsParam) {
        this.CXMLUriNoProxy = CXMLUri;
        if (proxy)
            this.CXMLUri = proxy + CXMLUri;
        else 
            this.CXMLUri = CXMLUri;
        if (allowHosts)
          this.allowHosts = allowHosts;
        else 
          this.allowHosts = false;
        this.allowedHosts = [];
        if (allowedHostsParam)
          this.allowedHosts = allowedHostsParam.split(',');
    },
    CheckAllowedServer: function () {
     var host;
     if (this.CXMLUri.startsWith ('http://')) {
       host = this.CXMLUri.substring(7, this.CXMLUri.indexOf('/' , 7));
     } else if (this.CXMLUri.startsWith ('https://')) {
       host = this.CXMLUri.substring(8, this.CXMLUri.indexOf('/' , 8));
     } else
       return true;

     // Do we have an allowed list?
     if (this.allowHosts) {
       for (var i = 0; i < this.allowedHosts.length; i++) {
         if (host == this.allowedHosts[i] || this.allowedHosts[i] == '*')
           return true;
       }
     }

     if (host == 'localhost' || (host.includes(':') && host.startsWith('localhost:')) ||
           host == '127.0.0.1' || (host.includes(':') && host.startsWith('127.0.0.1:')) ||
           host == location.host) {
           return true;
     } else {
         return false;
     }
    },
    LoadCollection: function (collection) {
        var collection = collection;
        this._super(collection);

        collection.CollectionBaseNoProxy = this.CXMLUriNoProxy;
        collection.CollectionBase = this.CXMLUri;

        // Before loading check that the server that the collection is loaded from is either 
        // localhost or whitelisted.
        if (this.CheckAllowedServer() == false) {
          throw "Collection is not hosted on an allowed server";
          return;
        }

        $.ajax({
            type: "GET",
            url: this.CXMLUri,
            dataType: "xml",
	    crossDomain : true,
            success: function (xml) {
                PivotViewer.Debug.Log('CXML loaded');
                var collectionRoot = $(xml).find("Collection")[0];
                var maxRelatedLinksLength = 0;
                //get namespace local name
                var namespacePrefix = "P";

                if (collectionRoot == undefined) {
                    //Make sure throbber is removed else everyone thinks the app is still running
                    $('.pv-loading').remove();
 
                    //Display message so the user knows something is wrong
                    var msg = '';
                    msg = msg + 'Error parsing CXML Collection<br>';
                    msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
                    $('.pv-wrapper').append("<div id=\"pv-parse-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                    var t=setTimeout(function(){window.open("#pv-parse-error","_self")},1000)
                    throw "Error parsing CXML Collection";
                }

                for (var i = 0; i < collectionRoot.attributes.length; i++) {
                    if (collectionRoot.attributes[i].value == "http://schemas.microsoft.com/livelabs/pivot/collection/2009") {
                        namespacePrefix = collectionRoot.attributes[i].localName != undefined ? collectionRoot.attributes[i].localName : collectionRoot.attributes[i].baseName;
                        break;
                    }
                }
                collection.CollectionName = $(collectionRoot).attr("Name");
                collection.BrandImage = $(collectionRoot).attr(namespacePrefix + ":BrandImage") != undefined ? $(collectionRoot).attr(namespacePrefix + ":BrandImage") : "";

                //FacetCategory
                var facetCategories = $(xml).find("FacetCategory");
                savedNamespacePrefix = namespacePrefix;
                for (var i = 0; i < facetCategories.length; i++) {
                    var facetElement = $(facetCategories[i]);

                    // Handle locally defined namespaces
                    for (var j = 0; j < facetElement[0].attributes.length; j++) {
                        if (facetElement[0].attributes[j].value == "http://schemas.microsoft.com/livelabs/pivot/collection/2009") {
                            namespacePrefix = facetElement[0].attributes[j].localName != undefined ? facetElement[0].attributes[j].localName : facetElement[0].attributes[j].baseName;
                            break;
                        }
                    }

                    var facetCategory = new PivotViewer.Models.FacetCategory(
                    facetElement.attr("Name"),
                        facetElement.attr("Format"),
                        facetElement.attr("Type"),
                        facetElement.attr(namespacePrefix + ":IsFilterVisible") != undefined ? (facetElement.attr(namespacePrefix + ":IsFilterVisible").toLowerCase() == "true" ? true : false) : true,
                        facetElement.attr(namespacePrefix + ":IsMetaDataVisible") != undefined ? (facetElement.attr(namespacePrefix + ":IsMetaDataVisible").toLowerCase() == "true" ? true : false) : true,
                        facetElement.attr(namespacePrefix + ":IsWordWheelVisible") != undefined ? (facetElement.attr(namespacePrefix + ":IsWordWheelVisible").toLowerCase() == "true" ? true : false) : true
                        );

                    //Add custom sort order
                    var sortOrder = facetElement.find(namespacePrefix + "\\:SortOrder");
                    var sortValues = sortOrder.find(namespacePrefix + "\\:SortValue");

                    if (sortOrder.length == 0) {
                        //webkit doesn't seem to like the P namespace
                        sortOrder = facetElement.find("SortOrder");
                        sortValues = sortOrder.find("SortValue");
                    }

                    if (sortOrder.length == 1) {
                        var customSort = new PivotViewer.Models.FacetCategorySort(sortOrder.attr("Name"));
                        for (var j = 0; j < sortValues.length; j++) {
                            customSort.SortValues.push($(sortValues[j]).attr("Value"));
                        }
                        facetCategory.CustomSort = customSort;
                    }
                    collection.FacetCategories.push(facetCategory);
                    namespacePrefix = savedNamespacePrefix;
                }
                //Items
                var facetItems = $(xml).find("Items");
                if (facetItems.length == 1) {
                    var facetItem = $(facetItems[0]).find("Item");
                    collection.ImageBase = $(facetItems[0]).attr("ImgBase");
                    if (facetItem.length == 0) {
                        //Make sure throbber is removed else everyone thinks the app is still running
                        $('.pv-loading').remove();
 
                        //Display a message so the user knows something is wrong
                        var msg = '';
                        msg = msg + 'There are no items in the CXML Collection<br><br>';
                        $('.pv-wrapper').append("<div id=\"pv-empty-collection-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                        var t=setTimeout(function(){window.open("#pv-empty-collection-error","_self")},1000)
                    } else {
                        for (var i = 0; i < facetItem.length; i++) {
                            var item = new PivotViewer.Models.Item(
                                $(facetItem[i]).attr("Img").replace("#", ""),
                                $(facetItem[i]).attr("Id"),
                                $(facetItem[i]).attr("Href"),
                                $(facetItem[i]).attr("Name")
                            );
                            var description = $(facetItem[i]).find("Description");
                            if (description.length == 1 && description[0].childNodes.length)
                                item.Description = PivotViewer.Utils.HtmlSpecialChars(description[0].childNodes[0].nodeValue);
                            var facets = $(facetItem[i]).find("Facet");
                            for (var j = 0; j < facets.length; j++) {
                                var f = new PivotViewer.Models.Facet(
                                    $(facets[j]).attr("Name")
                                );
               
                                var facetChildren = $(facets[j]).children();
                                for (var k = 0; k < facetChildren.length; k++) {
                                    if (facetChildren[k].nodeType == 1) {
                                        var v = $.trim($(facetChildren[k]).attr("Value"));
                                        if (v == null || v == "") {
                                            if (facetChildren[k].nodeName == "Link") {
                                                if ($(facetChildren[k]).attr("Href") == "" || $(facetChildren[k]).attr("Href") == null) {
                                                   var fValue = new PivotViewer.Models.FacetValue(PivotViewer.Utils.HtmlSpecialChars("(empty Link)"));
                                                   f.AddFacetValue(fValue);
                                              
                                                } else if ($(facetChildren[k]).attr("Name") == "" || $(facetChildren[k]).attr("Name") == null) {
                                                    var fValue = new PivotViewer.Models.FacetValue("(unnamed Link)");
                                                    fValue.Href = $(facetChildren[k]).attr("Href");
                                                    f.AddFacetValue(fValue);
                                                } else { 
                                                    var fValue = new PivotViewer.Models.FacetValue($(facetChildren[k]).attr("Name"));
                                                    fValue.Href = $(facetChildren[k]).attr("Href");
                                                    f.AddFacetValue(fValue);
                                                } 
                                            } else { 
                                                var fValue = new PivotViewer.Models.FacetValue(PivotViewer.Utils.HtmlSpecialChars("(empty " + facetChildren[k].nodeName + ")"));
                                                f.AddFacetValue(fValue);
                                            }
                                        } else {
                                            //convert strings to numbers so histogram can work
                                            if (facetChildren[k].nodeName == "Number") {
                                                var fValue = new PivotViewer.Models.FacetValue(parseFloat(v));
                                                f.AddFacetValue(fValue);
                                            } else {
                                                var fValue = new PivotViewer.Models.FacetValue(PivotViewer.Utils.HtmlSpecialChars(v));
                                                f.AddFacetValue(fValue);
                                            }
                                        }
                                    }
                                }
                                item.Facets.push(f);
                            }
                            var itemExtension = $(facetItem[i]).find("Extension");
                            if (itemExtension.length == 1) {
                                var savedNamespacePrefix = namespacePrefix;
                    
                                // Handle locally defined namespaces
                                for (var j = 0; j < itemExtension[0].childNodes.length; j++) {
                                    namespacePrefix = itemExtension[0].childNodes[j].lookupPrefix("http://schemas.microsoft.com/livelabs/pivot/collection/2009");
                                    if (namespacePrefix)
                                        break;
                                }

                                //var itemRelated = $(itemExtension[0]).find('d1p1\\:Related, Related');
                                var itemRelated = $(itemExtension[0]).find(namespacePrefix + '\\:Related, Related');
                                if (itemRelated.length == 1) {
                                    var links = $(itemRelated[0]).find(namespacePrefix + '\\:Link, Link');
                                    for (var l = 0; l < links.length; l++) {
                                        var linkName = $(links[l]).attr("Name"); 
                                        var linkHref = $(links[l]).attr("Href"); 
                                        if (linkHref.indexOf(".cxml") == -1 && 
                                            linkHref.indexOf("pivot.vsp") >= 0) {
                                                var url = $.url(this.url);
                                                linkHref = url.attr('protocol') + "://" + url.attr('authority') + url.attr('directory') + linkHref;
                                        }
                                        else if (linkHref.indexOf(".cxml") == -1 && 
                                            linkHref.indexOf("sparql") >= 0) {
                                                var url = $.url(this.url);
                                                linkHref = location.origin + location.pathname  +"?url=" + linkHref;
                                        }
                                        var link = new PivotViewer.Models.ItemLink(linkName, linkHref);
                                        item.Links.push(link);
                                    }
                                    if (links.length > maxRelatedLinksLength)
                                       maxRelatedLinksLength = links.length;
                                }
                                namespacePrefix = savedNamespacePrefix;
                            }
                            collection.Items.push(item);
                        }
                    }
                }
                collection.MaxRelatedLinks = maxRelatedLinksLength;
                //Extensions
                var extension = $(xml).find("Extension");
                if (extension.length > 1) {
                    for (x = 0; x < extension.length; x++) {
                        var savedNamespacePrefix = namespacePrefix;
                    
                        // Handle locally defined namespaces
                        for (var j = 0; j < extension[x].childNodes.length; j++) {
                            namespacePrefix = extension[0].childNodes[j].lookupPrefix("http://schemas.microsoft.com/livelabs/pivot/collection/2009");
                            if (namespacePrefix)
                                break;
                        }

                        //var collectionCopyright = $(extension[x]).find('d1p1\\:Copyright, Copyright');
                        var collectionCopyright = $(extension[x]).find(namespacePrefix + '\\:Copyright, Copyright');
                        if (collectionCopyright.length > 0) { 
                            collection.CopyrightName = $(collectionCopyright[0]).attr("Name");
                            collection.CopyrightHref = $(collectionCopyright[0]).attr("Href");
                            break;
                        }
                        namespacePrefix = savedNamespacePrefix;
                    }
                }

                if (facetItem.length > 0) 
                  $.publish("/PivotViewer/Models/Collection/Loaded", null);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //Make sure throbber is removed else everyone thinks the app is still running
                $('.pv-loading').remove();

		var state = {
			endpoint:	this.url,
			httpCode:	jqXHR.status,
			status:		jqXHR.statusText,
			message:	errorThrown,
			response:	jqXHR.responseText,
		}

		var p = document.createElement('a');
		p.href = this.url;

		state.endpoint = p.protocol + '//' + p.host + p.pathname;

		if (state.status === 'timeout') {
		  state.message = "Timeout loading collection document";
		} else if (state.status === 'error') {
		  if (this.crossDomain && (p.hostname !== window.location.hostname)) {
		    state.message = "Possible issue with CORS settings on the endpoint"
		  }
		} 

                //Display a message so the user knows something is wrong
                var msg = '';
                msg = msg + 'Error loading CXML Collection:<br><br><table>';
		msg = msg + '<colgroup><col style="white-space:nowrap;"><col></colgroup>';
                msg = msg + '<tr><td>Endpoint</td><td>' + state.endpoint + '</td></tr>';
                msg = msg + '<tr><td>Status</td><td>' + state.httpCode + '</td></tr>';
                msg = msg + '<tr><td>Error</td><td> ' + state.message  + '</td></tr>';
                msg = msg + '<tr><td style="vertical-align:top">Details</td><td>' + state.response + '</td></tr>';
                msg = msg + '</table><br>Pivot Viewer cannot continue until this problem is resolved<br>';
                $('.pv-wrapper').append("<div id=\"pv-loading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                var t=setTimeout(function(){window.open("#pv-loading-error","_self")},1000)
            }
        });
    }
});
//
//  HTML5 PivotViewer
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

//JSON loader
PivotViewer.Models.Loaders.JSONLoader = PivotViewer.Models.Loaders.ICollectionLoader.subClass({
    init: function (JSONUri, proxy) {
        this.JSONUriNoProxy = JSONUri;
        if (proxy)
            this.JSONUri = proxy + JSONUri;
        else 
            this.JSONUri = JSONUri;
    },
    LoadCollection: function (collection) {
        var collection = collection;
        this._super(collection);

        collection.CollectionBaseNoProxy = this.JSONUriNoProxy;
        collection.CollectionBase = this.JSONUri;

        var jqXHR = $.getJSON(this.JSONUri) 
        .done(function(data) {
            PivotViewer.Debug.Log('JSON loaded');

            if (data.FacetCategories == undefined || data.Items == undefined) {
                //Make sure throbber is removed else everyone thinks the app is still running
                $('.pv-loading').remove();
 
                //Display message so the user knows something is wrong
                var msg = '';
                msg = msg + 'Error parsing CXML Collection<br>';
                msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
                $('.pv-wrapper').append("<div id=\"pv-parse-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                var t=setTimeout(function(){window.open("#pv-parse-error","_self")},1000)
                throw "Error parsing CXML Collection";
            }

            if (data.CollectionName != undefined) 
                collection.CollectionName = data.CollectionName;

            if (data.BrandImage != undefined) 
                collection.BrandImage = data.BrandImage;

            //FacetCategories
            for (var i = 0; i < data.FacetCategories.FacetCategory.length; i++) {

               var facetCategory = new PivotViewer.Models.FacetCategory(
                    data.FacetCategories.FacetCategory[i].Name,
                    data.FacetCategories.FacetCategory[i].Format,
                    data.FacetCategories.FacetCategory[i].Type,
                    data.FacetCategories.FacetCategory[i].IsFilterVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsFilterVisible.toLowerCase() == "true" ? true : false) : true,
                    data.FacetCategories.FacetCategory[i].IsMetadataVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsMetadataVisible.toLowerCase() == "true" ? true : false) : true,
                    data.FacetCategories.FacetCategory[i].IsWordWheelVisible != undefined ? (data.FacetCategories.FacetCategory[i].IsWordWheelVisible.toLowerCase() == "true" ? true : false) : true
                    );

                  if (data.FacetCategories.FacetCategory[i].SortOrder != undefined) {
                        var customSort = new PivotViewer.Models.FacetCategorySort(data.FacetCategories.FacetCategory[i].SortOrder.Name);
                        for (j = 0; j < data.FacetCategories.FacetCategory[i].SortValues.Value.length; J++)
                            customSort.Values.push(data.FacetCategories.FacetCategory[i].SortValues.Value[j]);
                        facetCategory.CustomSort = customSort;
                    }

                collection.FacetCategories.push(facetCategory);
            }

            if (data.Items.ImgBase != undefined) collection.ImageBase = data.Items.ImgBase;

            // Item 
            if (data.Items.Item.length == 0) {

                //Make sure throbber is removed else everyone thinks the app is still running
                $('.pv-loading').remove();

                //Display a message so the user knows something is wrong
                var msg = '';
                msg = msg + 'There are no items in the CXML Collection<br><br>';
                $('.pv-wrapper').append("<div id=\"pv-empty-collection-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                var t=setTimeout(function(){window.open("#pv-empty-collection-error","_self")},1000)
            } else {
                for (var i = 0; i < data.Items.Item.length; i++) {
                   var item = new PivotViewer.Models.Item(
                        data.Items.Item[i].Img.replace("#", ""),
                        data.Items.Item[i].Id,
                        data.Items.Item[i].Href,
                        data.Items.Item[i].Name
                    );

                    item.Description = PivotViewer.Utils.HtmlSpecialChars(data.Items.Item[i].Description);

                   for (j = 0; j < data.Items.Item[i].Facets.Facet.length; j++) {
		       var values = [];
                       if (data.Items.Item[i].Facets.Facet[j].Number != undefined) {
                           if ( data.Items.Item[i].Facets.Facet[j].Number.length > 0) {
                               for (k = 0; k < data.Items.Item[i].Facets.Facet[j].Number.length; k++) {
                                   var value = new PivotViewer.Models.FacetValue(parseFloat(data.Items.Item[i].Facets.Facet[j].Number[k].Value));
                                   values.push(value);
                               }
                           } else {
                                   var value = new PivotViewer.Models.FacetValue(parseFloat(data.Items.Item[i].Facets.Facet[j].Number.Value));
                                   values.push(value);
                           }
                       } else if (data.Items.Item[i].Facets.Facet[j].Link != undefined) {
                           for (k = 0; k < data.Items.Item[i].Facets.Facet[j].Link.length; k++) {
                               var value = new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].Link[k].Name);
                               value.Href = data.Items.Item[i].Facets.Facet[j].Link[k].Href;
                               values.push(value);
                           }
                       } else if (data.Items.Item[i].Facets.Facet[j].String != undefined) {
                           if ( data.Items.Item[i].Facets.Facet[j].String.length > 0) {
                               for (k = 0; k < data.Items.Item[i].Facets.Facet[j].String.length; k++) {
                                   var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].String[k].Value);
                                   values.push(value);
                               }
                           } else {
                                   var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].String.Value);
                                   values.push(value);
                           }
                       } else if (data.Items.Item[i].Facets.Facet[j].LongString != undefined) {
                           if ( data.Items.Item[i].Facets.Facet[j].LongString.length > 0) {
                               for (k = 0; k < data.Items.Item[i].Facets.Facet[j].LongString.length; k++) {
                                   var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].LongString[k].Value);
                                   values.push(value);
                               }
                           } else {
                                   var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].LongString.Value);
                                   values.push(value);
                           }
                       } else if (data.Items.Item[i].Facets.Facet[j].DateTime != undefined) {
                           if ( data.Items.Item[i].Facets.Facet[j].DateTime.length > 0) {
                               for (k = 0; k < data.Items.Item[i].Facets.Facet[j].DateTime.length; k++) {
                                   var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].DateTime[k].Value);
                                   values.push(value);
                               }
                           } else {
                                   var value =  new PivotViewer.Models.FacetValue(data.Items.Item[i].Facets.Facet[j].DateTime.Value);
                                   values.push(value);
                           }
                       } else { // Unexpected data type

                            //Make sure throbber is removed else everyone thinks the app is still running
                            $('.pv-loading').remove();
   
                            //Display a message so the user knows something is wrong
                            var msg = '';
                            msg = msg + 'Error parsing the CXML Collection:<br>Unrecognised facet value type<br>';
                            $('.pv-wrapper').append("<div id=\"pv-parse-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                            var t=setTimeout(function(){window.open("#pv-parse-error","_self")},1000)
                       }

                       var facet = new PivotViewer.Models.Facet (
                           data.Items.Item[i].Facets.Facet[j].Name,
                           values
                       );
                       item.Facets.push(facet);
                   }

                   // Handle related links here 
                   if (data.Items.Item[i].Extension != undefined 
                       && data.Items.Item[i].Extension.Related != undefined) 
                       item.Links = data.Items.Item[i].Extension.Related.Link;

                   collection.Items.push(item);
                }
            }

            //Extensions
            if (data.Extension != undefined) {
                if (data.Extension.Copyright != undefined) {
                    collection.CopyrightName = data.Extension.Copyright.Name;
                    collection.CopyrightHref = data.Extension.Copyright.Href;
                }
            }

            if (data.Items.Item.length > 0) 
              $.publish("/PivotViewer/Models/Collection/Loaded", null);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
                //Make sure throbber is removed else everyone thinks the app is still running
                $('.pv-loading').remove();

                //Display a message so the user knows something is wrong
                var msg = '';
                msg = msg + 'Error loading CXML Collection<br><br>';
                msg = msg + 'URL        : ' + this.url + '<br>';
                msg = msg + 'Status : ' + jqXHR.status + ' ' + errorThrown + '<br>';
                msg = msg + 'Details    : ' + jqXHR.responseText + '<br>';
                msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
                $('.pv-wrapper').append("<div id=\"pv-loading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                var t=setTimeout(function(){window.open("#pv-loading-error","_self")},1000)
        });
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///Views interface - all views must implement this
PivotViewer.Views.IPivotViewerView = Object.subClass({
	init: function () {
		this.isActive = false;
		this.init = true;
		this.selected = "";
		this.tiles = [];
	},
	Setup: function (width, height, offsetX, offsetY, tileMaxRatio) { },
	Filter: function (dzTiles, currentFilter, sortFacet) { },
	GetUI: function () { return ''; },
	GetButtonImage: function () { return ''; },
	GetButtonImageSelected: function () { return ''; },
	GetViewName: function () { return ''; },
	Activate: function () { this.isActive = true; },
	Deactivate: function () { this.isActive = false; }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

PivotViewer.Views.TileBasedView = PivotViewer.Views.IPivotViewerView.subClass({
	OffsetTiles: function (offsetX, offsetY) {
		for (var i = 0; i < this.tiles.length; i++) {
			var filterindex = $.inArray(this.tiles[i].facetItem.Id, this.currentFilter);
			//set outer location for all tiles not in the filter
			if (filterindex >= 0) {
                               this.tiles[i]._locations[0].destinationx += offsetX;
                               this.tiles[i]._locations[0].destinationy += offsetY;
			}
		}
	},

	SetInitialTiles: function (dzTiles, canvasWidth, canvasHeight) {
		var initx = canvasWidth / 2;
		var inity = canvasHeight / 2;
		for (var i = 0; i < dzTiles.length; i++) {
			dzTiles[i]._locations[0].x = initx;
			dzTiles[i]._locations[0].y = inity;
			dzTiles[i].velocityx = 0;
			dzTiles[i].velocityy = 0;
			dzTiles[i]._locations[0].startx = initx;
			dzTiles[i]._locations[0].starty = inity;
			dzTiles[i]._locations[0].destinationx = 0;
			dzTiles[i]._locations[0].destinationy = 0;
			dzTiles[i].width = 1;
			dzTiles[i].height = 1;
		}
	},

	GetRowsAndColumns: function (canvasWidth, canvasHeight, tileMaxRatio, tileCount) {
		// look into creating a series of calcs that will try multiple times changing the gap
		var gap = 0.7;
		var a = tileMaxRatio * (tileCount - Math.pow(gap, 2));
		var b = (canvasHeight + (canvasWidth * tileMaxRatio)) * gap;
		var c = -1 * (canvasHeight * canvasWidth);
		var tileMaxWidth = ((-1 * b) + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
		var tileHeight = Math.floor(tileMaxWidth * tileMaxRatio);
		var canvasRows = Math.ceil(canvasHeight / tileHeight);
		var canvasColumns = Math.floor(canvasWidth / tileMaxWidth);
                var paddingX = canvasWidth - (canvasColumns * tileMaxWidth);
		return { Rows: canvasRows, Columns: canvasColumns, TileMaxWidth: tileMaxWidth, TileHeight: tileHeight, PaddingX : paddingX };
	},

	SetOuterTileDestination: function (canvasWidth, canvasHeight, tile) {
		//http://mathworld.wolfram.com/Circle-LineIntersection.html
		//http://stackoverflow.com/questions/6091728/line-segment-circle-intersection
		//Get adjusted x and y
		// as x2 and y2 are the origin
		var dx = tile._locations[0].x - (canvasWidth / 2);
		var dy = tile._locations[0].y - (canvasHeight / 2);
		var M = dy / dx;
		var theta = Math.atan2(dy, dx)
		tile._locations[0].destinationx = canvasWidth * Math.cos(theta) + (canvasWidth / 2);
		tile._locations[0].destinationy = canvasHeight * Math.sin(theta) + (canvasHeight / 2);
	},

	//http://stackoverflow.com/questions/979256/how-to-sort-an-array-of-javascript-objects
	SortBy: function (field, reverse, primer, filterValues) {

		var key = function (x, filterValues) {
			if (primer) {
				for (var i = x.facetItem.Facets.length - 1; i > -1; i -= 1) {
					if (x.facetItem.Facets[i].Name == field && x.facetItem.Facets[i].FacetValues.length > 0) {
                                            // If a numeric value could check if value is within filter 
                                            // bounds but will have been done already
                                            if ($.isNumeric(x.facetItem.Facets[i].FacetValues[0].Value) )
					            return primer(x.facetItem.Facets[i].FacetValues[0].Value);
                                            // If a string facet then could have a number of values.  Only
                                            // sort on values in the filter 
                                            else {                      
                                                for (var j = 0; j < x.facetItem.Facets[i].FacetValues.length; j++) {
                                                    // Has a filter been set? If so, and it is the same facet as the sort
                                                    // then sort on the items in the filter where possible (otherwise just 
                                                    // use the first value.?
                                                    if (filterValues.length > 0) {
                                                        for (var k = 0; k < filterValues.length; k++) {
                                                            if (filterValues[k].facet == field) {
                                                                 for (var l = 0; l < filterValues[k].facetValue.length; l++) {
                                                                     if ( x.facetItem.Facets[i].FacetValues[j].Value == filterValues[k].facetValue[l]) {  
					                                 return primer(x.facetItem.Facets[i].FacetValues[j].Value);
                                                                     }
                                                                 }
                                                             } 
                                                        }
                                                    } 
                                                }
                                                return primer(x.facetItem.Facets[i].FacetValues[0].Value);
                                            }
                                        }
				}
			}
			return null;
		};

		return function (a, b) {
			var A = key(a, filterValues), B = key(b, filterValues);
			return (A < B ? -1 : (A > B ? 1 : 0)) * [1, -1][+!!reverse];
		}
	}
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///Data View
PivotViewer.Views.DataView = PivotViewer.Views.IPivotViewerView.subClass({
	init: function () {
		this._super();
	},
	Setup: function (width, height, offsetX, offsetY, tileMaxRatio) { },
	Filter: function (dzTiles, currentFilter, sortFacet) { },
	GetUI: function () { return ''; },
	GetButtonImage: function () { return ''; },
	GetButtonImageSelected: function () { return ''; },
	GetViewName: function () { return 'Grid View'; },
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///
/// Graph (histogram) View
///
PivotViewer.Views.GraphView = PivotViewer.Views.TileBasedView.subClass({
    init: function () {
        this._super();
        var that = this;
        this.buckets = [];
        this.Scale = 1;
        this.canvasHeightUIAdjusted = 0;
        this.titleSpace = 62;
        this.dontZoom = false;

        //Event Handlers
        $.subscribe("/PivotViewer/Views/Canvas/Click", function (evt) {
            if (!that.isActive)
                return;

            var selectedItem = null;
            var selectedTile = null;
            var selectedLoc = null;
            for (var i = 0; i < that.tiles.length; i++) {
	        var loc = that.tiles[i].Contains(evt.x, evt.y);
                if ( loc >= 0 ) {
                    selectedTile = that.tiles[i];
                    selectedItem = that.tiles[i].facetItem.Id;
                    selectedLoc = loc;
                } else {
                    that.tiles[i].Selected(false);
                }
            }
	    that.handleSelection (selectedItem, selectedTile, evt.x, selectedLoc);
	});

        $.subscribe("/PivotViewer/Views/Canvas/Hover", function (evt) {
            if (!that.isActive)
                return;
            $('.pv-viewarea-graphview-overlay-bucket').removeClass('graphview-bucket-hover');
            //determine bucket and select
            var bucketNumber = Math.floor((evt.x - that.offsetX) / that.columnWidth);
            var bucketDiv = $('#pv-viewarea-graphview-overlay-bucket-' + bucketNumber);
            bucketDiv.addClass('graphview-bucket-hover');
            //determine tile
            for (var i = 0; i < that.tiles.length; i++) {
	        var loc = that.tiles[i].Contains(evt.x, evt.y);
                if (loc >= 0) {
                    that.tiles[i].Selected(true);
                    that.tiles[i].selectedLoc = loc;
                }
                else
                    that.tiles[i].Selected(false);
            }
        });

        $.subscribe("/PivotViewer/Views/Canvas/Zoom", function (evt) {
            if (!that.isActive)
                return;

            if (that.dontZoom) {
                that.dontZoom = false;
                return;
            }
            var oldScale = that.Scale;
            var preWidth = that.currentWidth;
            var preHeight = that.currentHeight;
            //Set the zoom time - the time it takes to zoom to the scale
            //if on a touch device where evt.scale != undefined then have no delay
            var zoomTime = evt.scale != undefined ? 0 : 1000;

            if (evt.scale != undefined) {
                if (evt.scale >= 1)
                    that.Scale += (evt.scale - 1);
                else {
                    that.Scale -= evt.scale;
                    that.Scale = that.Scale < 1 ? 1 : that.Scale;
                }
            } else if (evt.delta != undefined)
                that.Scale = evt.delta == 0 ? 1 : (that.Scale + evt.delta - 1);

            if (that.Scale == NaN)
                that.Scale = 1;

            var newWidth = (that.width - that.offsetX) * that.Scale;
            var newHeight = that.height * that.Scale;

            //if trying to zoom out too far, reset to min
            if (newWidth < that.width || that.Scale == 1) {
                that.currentOffsetX = that.offsetX;
                that.currentOffsetY = that.offsetY;
                that.currentWidth = that.width;
                that.currentHeight = that.height;
                that.canvasHeightUIAdjusted = that.height - that.offsetY - that.titleSpace;
                that.columnWidth = (that.width - that.offsetX) / that.buckets.length;
                that.Scale = 1;
                $('.pv-viewarea-graphview-overlay div').fadeIn('slow');
                // Reset the slider to zero 
                that.dontZoom = true;
                $('.pv-toolbarpanel-zoomslider').slider('option', 'value', 0);
            } else {
                //adjust position to base scale - then scale out to new scale
                //Move the scaled position to the mouse location
                that.currentOffsetX = evt.x - (((evt.x - that.currentOffsetX) / oldScale) * that.Scale);

                //Work out the scaled position of evt.y and then calc the difference between the actual evt.y
                var scaledPositionY = ((evt.y - that.currentOffsetY) / oldScale) * that.Scale;
                that.currentOffsetY = evt.y - scaledPositionY;
                that.canvasHeightUIAdjusted = newHeight - (((that.offsetY + that.titleSpace)/oldScale) * that.Scale);

                that.currentWidth = newWidth;
                that.currentHeight = newHeight;
                that.columnWidth = newWidth / that.buckets.length;
                $('.pv-viewarea-graphview-overlay div').fadeOut('slow');
            }

            that.rowscols = that.GetRowsAndColumns(that.columnWidth - 2, that.canvasHeightUIAdjusted, that.maxRatio, that.bigCount);
            if (that.rowscols.TileHeight < 10 ) that.rowscols.TileHeight = 10;
            that.SetVisibleTileGraphPositions(that.rowscols, that.currentOffsetX, that.currentOffsetY, true, true);

            //deselect tiles if zooming back to min size
            if (that.Scale == 1 && oldScale != 1) {
                for (var i = 0; i < that.tiles.length; i++) {
                    that.tiles[i].Selected(false);
                    that.tiles[i].selectedLoc = 0;
                }
                that.selected = "";
                $.publish("/PivotViewer/Views/Item/Selected", [{id: that.selected, bkt: 0}]);
            }
        });

        $.subscribe("/PivotViewer/Views/Canvas/Drag", function (evt) {
            if (!that.isActive)
                return;

            var dragX = evt.x;
            var dragY = evt.y;
            var noChangeX = false, noChangeY = false;
            that.currentOffsetX += dragX;
            that.currentOffsetY += dragY;

            //LHS bounds check
            if (dragX > 0 && that.currentOffsetX > that.offsetX) {
                that.currentOffsetX -= dragX;
                noChangeX = true;
            }
            //Top bounds check
            if (dragY > 0 && (that.currentOffsetY + that.canvasHeightUIAdjusted) > that.currentHeight + that.offsetY) {
                that.currentOffsetY -= dragY;
                noChangeY = true;
            }
            //RHS bounds check
            //if the current offset is smaller than the default offset and the zoom scale == 1 then stop drag
            if (that.currentOffsetX < that.offsetX && that.currentWidth == that.width) {
                that.currentOffsetX -= dragX;
                noChangeX = true;
            }
            if (dragX < 0 && (that.currentOffsetX) < -1 * (that.currentWidth - that.width)) {
                that.currentOffsetX -= dragX;
                noChangeX = true;
            }
            //bottom bounds check

            if (that.currentOffsetY < that.offsetY && that.currentHeight == that.height) {
                that.currentOffsetY -= dragY;
                noChangeY = true;
            }
            if (dragY < 0 && (that.currentOffsetY - that.offsetY) < -1 * (that.currentHeight - that.height)) {
                that.currentOffsetY -= dragY;
                noChangeY = true;
            }

            if (noChangeX && noChangeY)
                return;
            if (noChangeX)
                that.OffsetTiles(0, dragY);
            else if (noChangeY)
                that.OffsetTiles(dragX, 0);
            else
                that.OffsetTiles(dragX, dragY);
        });
    },
    Setup: function (width, height, offsetX, offsetY, tileMaxRatio) {
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.maxRatio = tileMaxRatio;
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        this.currentOffsetX = this.offsetX;
        this.currentOffsetY = this.offsetY;
        this.rowscols = null;
        this.bigCount = 0;
    },
    Filter: function (dzTiles, currentFilter, sortFacet, stringFacets, changingView, changeViewSelectedItem) {
        var that = this;
        if (!Modernizr.canvas)
            return;

        PivotViewer.Debug.Log('Graph View Filtered: ' + currentFilter.length);

        this.changingView = false;
        if (changingView) {
            if ($('.pv-tableview-table').is(':visible')){
                $('.pv-tableview-table').fadeOut();
                $('.pv-tableview-table').fadeOut();
                $('.pv-toolbarpanel-zoomslider').fadeIn();
                $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                $('.pv-viewarea-canvas').fadeIn();
            }
            if ($('.pv-mapview-canvas').is(':visible')){
                $('.pv-toolbarpanel-maplegend').fadeOut(400, function(){
                    $('.pv-toolbarpanel-zoomslider').fadeIn();
                    $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                });
                $('.pv-mapview-legend').fadeOut();
                $('.pv-mapview-canvas').fadeOut();
                $('.pv-viewarea-canvas').fadeIn();
            }
            if ($('.pv-timeview-canvas').is(':visible')){
                $('.pv-timeview-canvas').fadeOut();
                $('.pv-toolbarpanel-timelineselector').fadeOut();
                $('.pv-toolbarpanel-maplegend').fadeOut();
                $('.pv-toolbarpanel-sort').fadeIn();
                $('.pv-toolbarpanel-zoomslider').fadeIn();
                $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                $('#MAIN_BODY').css('overflow', 'auto');
                $('.pv-viewarea-canvas').fadeIn();
            }
            if ($('.pv-mapview2-canvas').is(':visible')){
                $('.pv-mapview2-canvas').fadeOut();
                $('.pv-toolbarpanel-zoomslider').fadeIn();
                $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                $('.pv-viewarea-canvas').fadeIn();
            }
        }

        this.sortFacet = sortFacet;
        this.tiles = dzTiles;

        //Sort
        this.tiles = dzTiles.sort(this.SortBy(this.sortFacet, false, function (a) {
            return $.isNumeric(a) ? a : a.toUpperCase();
        }, stringFacets));
        this.currentFilter = currentFilter;

        this.buckets = this.Bucketize(dzTiles, currentFilter, this.sortFacet, stringFacets);

        this.columnWidth = (this.width - this.offsetX) / this.buckets.length;
        this.canvasHeightUIAdjusted = this.height -this.offsetY - this.titleSpace;

        //Find biggest bucket to determine tile size, rows and cols
        //Also create UI elements
        var uiElements = [];
        this.bigCount = 0;
       for (var i = 0; i < this.buckets.length; i++) {
            var styleClass = i % 2 == 0 ? "graphview-bucket-dark" : "graphview-bucket-light";
            uiElements[i] = "<div class='pv-viewarea-graphview-overlay-bucket " + styleClass + "' id='pv-viewarea-graphview-overlay-bucket-" + i + "' style='width: " + (Math.floor(this.columnWidth) - 4) + "px; height:" + (this.height - 2) + "px; left:" + ((i * this.columnWidth) - 2) + "px;'>";
            if (this.buckets[i].startRange == this.buckets[i].endRange)
                uiElements[i] += "<div class='pv-viewarea-graphview-overlay-buckettitle' style='top: " + (this.canvasHeightUIAdjusted + 4) + "px;'>" + this.buckets[i].startRange + "</div></div>";
            else
                uiElements[i] += "<div class='pv-viewarea-graphview-overlay-buckettitle' style='top: " + (this.canvasHeightUIAdjusted + 4) + "px;'>" + this.buckets[i].startRange + "<br/>to<br/>" + this.buckets[i].endRange + "</div></div>";

            if (this.bigCount < this.buckets[i].Ids.length) {
                this.bigCount = this.buckets[i].Ids.length;
            }
        }

        //remove previous elements
        var graphViewOverlay = $('.pv-viewarea-graphview-overlay');
        graphViewOverlay.css('left', this.offsetX + 'px');
        $('.pv-viewarea-graphview-overlay div').fadeOut('slow', function () { $(this).remove(); });
        graphViewOverlay.append(uiElements.join(''));
        $('.pv-viewarea-graphview-overlay div').fadeIn('slow');

        for (var i = 0; i < this.tiles.length; i++) {
            //setup tiles
            this.tiles[i]._locations[0].startx = this.tiles[i]._locations[0].x;
            this.tiles[i]._locations[0].starty = this.tiles[i]._locations[0].y;
            this.tiles[i].startwidth = this.tiles[i].width;
            this.tiles[i].startheight = this.tiles[i].height;

            var filterindex = $.inArray(this.tiles[i].facetItem.Id, currentFilter);
            //set outer location for all tiles not in the filter
            if (filterindex < 0) {
                this.SetOuterTileDestination(this.width, this.height, this.tiles[i]);
                this.tiles[i].start = PivotViewer.Utils.Now();
                this.tiles[i].end = this.tiles[i].start + 1000;
            }
        }

        // recalculate max width of images in filter
        that.maxRatio = that.tiles[0]._controller.GetRatio(that.tiles[0].facetItem.Img);
        for (var i = 0; i < that.tiles.length; i++) {
            var filterindex = $.inArray(that.tiles[i].facetItem.Id, currentFilter);
            if (filterindex >= 0) {
                if (that.tiles[i]._controller.GetRatio(that.tiles[i].facetItem.Img) < that.maxRatio)
                    that.maxRatio = that.tiles[i]._controller.GetRatio(that.tiles[i].facetItem.Img);
            }
        }
        
        var pt2Timeout = currentFilter.length == this.tiles.length ? 0 : 500;
        //Delay pt2 animation
        setTimeout(function () {
            // Clear selection
            var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
            if (value > 0) { 
                this.selected = selectedItem = "";
                //zoom out
                this.currentOffsetX = this.offsetX;
                this.currentOffsetY = this.offsetY;
                // Zoom using the slider event
                $('.pv-toolbarpanel-zoomslider').slider('option', 'value', 1);
            }
            that.rowscols = that.GetRowsAndColumns(that.columnWidth - 2, that.canvasHeightUIAdjusted - that.offsetY, that.maxRatio, that.bigCount);
            if (that.rowscols.TileHeight < 10 ) that.rowscols.TileHeight = 10;
            for (var i = 0; i < that.tiles.length; i++) {
                that.tiles[i].origwidth = that.rowscols.TileHeight / that.tiles[i]._controller.GetRatio(that.tiles[i].facetItem.Img);
                that.tiles[i].origheight = that.rowscols.TileHeight;
            }
            that.SetVisibleTileGraphPositions(that.rowscols, that.offsetX, that.offsetY, false, false);

        }, pt2Timeout);

        this.init = false;
    },
    GetUI: function () {
        if (Modernizr.canvas)
            return "<div class='pv-viewarea-graphview-overlay'></div>";
        else
            return "<div class='pv-viewpanel-unabletodisplay'><h2>Unfortunately this view is unavailable as your browser does not support this functionality.</h2>Please try again with one of the following supported browsers: IE 9+, Chrome 4+, Firefox 2+, Safari 3.1+, iOS Safari 3.2+, Opera 9+<br/><a href='http://caniuse.com/#feat=canvas'>http://caniuse.com/#feat=canvas</a></div>";
    },
    GetButtonImage: function () {
        return 'images/GraphView.png';
    },
    GetButtonImageSelected: function () {
        return 'images/GraphViewSelected.png';
    },
    GetViewName: function () {
        return 'Graph View';
    },
    GetSortedFilter: function () {
      var itemArray = [];
      for (i = 0; i < this.buckets.length; i++) {
          for (j = 0; j < this.buckets[i].Ids.length; j++) {
             var obj = new Object ();
             obj.Id = this.buckets[i].Ids[j];
             obj.Bucket = i;
             itemArray.push(obj);
          }
      }
      return itemArray;
    },
    /// Sets the tiles position based on the GetRowsAndColumns layout function
    SetVisibleTileGraphPositions: function (rowscols, offsetX, offsetY, initTiles, keepColsRows) {
        var columns = (keepColsRows && this.rowscols)  ? this.rowscols.Columns : rowscols.Columns;
        if (!keepColsRows)
            this.rowscols = rowscols;

        var startx = [];
        var starty = [];

        // First clear all tile locations greater that 1
        for (var l = 0; l < this.tiles.length; l++) {
            this.tiles[l].firstFilterItemDone = false;
            while (this.tiles[l]._locations.length > 1) 
                this.tiles[l]._locations.pop();   
        }
             
        for (var i = 0; i < this.buckets.length; i++) {
            var currentColumn = 0;
            var currentRow = 0;
            for (var j = 0, _jLen = this.tiles.length; j < _jLen; j++) {
                if ($.inArray(this.tiles[j].facetItem.Id, this.buckets[i].Ids) >= 0) {

                    if (!this.tiles[j].firstFilterItemDone) {
                        if (initTiles) {
                            //setup tile initial positions
                            this.tiles[j]._locations[0].startx = this.tiles[j]._locations[0].x;
                            this.tiles[j]._locations[0].starty = this.tiles[j]._locations[0].y;
                            this.tiles[j].startwidth = this.tiles[j].width;
                            this.tiles[j].startheight = this.tiles[j].height;
                        }
                   
                        this.tiles[j].destinationwidth = rowscols.TileMaxWidth;
                        this.tiles[j].destinationheight = rowscols.TileHeight;
                        this.tiles[j]._locations[0].destinationx = (i * this.columnWidth) + (currentColumn * rowscols.TileMaxWidth) + offsetX;
                        this.tiles[j]._locations[0].destinationy = this.canvasHeightUIAdjusted - rowscols.TileHeight - (currentRow * rowscols.TileHeight) + offsetY;
                        this.tiles[j].start = PivotViewer.Utils.Now();
                        this.tiles[j].end = this.tiles[j].start + 1000;
                        this.tiles[j].firstFilterItemDone = true;
                    } else {
                        tileLocation = new PivotViewer.Views.TileLocation();
                        tileLocation.startx = this.tiles[j]._locations[0].startx;
                        tileLocation.starty = this.tiles[j]._locations[0].starty;
                        tileLocation.x = this.tiles[j]._locations[0].x;
                        tileLocation.y = this.tiles[j]._locations[0].y;
                        tileLocation.destinationx = (i * this.columnWidth) + (currentColumn * rowscols.TileMaxWidth) + offsetX;
                        tileLocation.destinationy = this.canvasHeightUIAdjusted - rowscols.TileHeight - (currentRow * rowscols.TileHeight) + offsetY;
                        this.tiles[j]._locations.push(tileLocation);
                    }

                    if (currentColumn == columns - 1) {
                        currentColumn = 0;
                        currentRow++;
                    }
                    else
                        currentColumn++;
                }
            }
        }
    },
    GetDatetimeBuckets: function (bktArray, filterList, name) {
        var newBkts = [];
        var handled = [];
        for (var i = 0; i < bktArray.length; i++) {
            var datetimeitem = $('#pv-facet-item' + CleanName(name) + "__" + CleanName(bktArray[i].Name.toString()));
            for (var j = 0; j < filterList.length; j++) {
                if (bktArray[i].Items.indexOf(filterList[j]) != -1) {
                    var bucketIndex = -1;
                    if (newBkts.length == 0)
                        newBkts.push({startRange: bktArray[i].Name, endRange: bktArray[i].Name, Ids:[filterList[j]], Values:[bktArray[i].Name]});
                    else {
                        for (var k = 0; k < newBkts.length; k++) {
                            if (newBkts[k].startRange == bktArray[i].Name) 
                                bucketIndex = k;
                        }
                        if (bucketIndex > -1)          
                            newBkts[bucketIndex].Ids.push(filterList[j]);
                        else
                            newBkts.push({startRange: bktArray[i].Name, endRange: bktArray[i].Name, Ids:[filterList[j]], Values:[bktArray[i].Name]});
                    }
                    handled.push(filterList[j]);
                }
            }
        }
        // Anything in the filter list that isn't now in a bucket needs to go in the '(no info)' bucket
        newBkts.push({startRange: '(no info)', endRange: '(no info)', Ids:[], Values:['(no info)']});
        for (var k = 0; k < filterList.length; k++) {
            if (handled.indexOf(filterList[k]) == -1)
                newBkts[newBkts.length - 1].Ids.push(filterList[k]);
        }
        if (newBkts[newBkts.length - 1].Ids.length == 0)
            newBkts.pop();

        return newBkts;
    },
    //Groups into buckets based on first n chars
    Bucketize: function (dzTiles, filterList, orderBy, stringFacets) {
        var bkts = [];
        // Handle datetime data differently.
        var orderByCategory;

        for (i = 0; i < this.categories.length; i++) {
             if (this.categories[i].Name == orderBy) {
                 orderByCategory = this.categories[i];
                 break;
            }
        }
        if (orderByCategory.Type == PivotViewer.Models.FacetType.DateTime) {
            //Start with biggest time difference
            var dtBuckets;
            dtBuckets = this.GetDatetimeBuckets(orderByCategory.decadeBuckets, filterList, orderByCategory.Name);
            if (dtBuckets.length > 1)
                return dtBuckets;
            dtBuckets = this.GetDatetimeBuckets(orderByCategory.yearBuckets, filterList, orderByCategory.Name);
            if (dtBuckets.length > 1)
                return dtBuckets;
            dtBuckets = this.GetDatetimeBuckets(orderByCategory.monthBuckets, filterList, orderByCategory.Name);
            if (dtBuckets.length > 1)
                return dtBuckets;
            dtBuckets = this.GetDatetimeBuckets(orderByCategory.dayBuckets, filterList, orderByCategory.Name);
            if (dtBuckets.length > 1)
                return dtBuckets;
            dtBuckets = this.GetDatetimeBuckets(orderByCategory.hourBuckets, filterList, orderByCategory.Name);
            if (dtBuckets.length > 1)
                return dtBuckets;
            dtBuckets = this.GetDatetimeBuckets(orderByCategory.minuteBuckets, filterList, orderByCategory.Name);
            if (dtBuckets.length > 1)
                return dtBuckets;
            dtBuckets = this.GetDatetimeBuckets(orderByCategory.secondBuckets, filterList, orderByCategory.Name);
            return dtBuckets;
        }
        for (var i = 0; i < dzTiles.length; i++) {
            if ($.inArray(dzTiles[i].facetItem.Id, filterList) >= 0) {
                var hasValue = false;
                for (var j = 0; j < dzTiles[i].facetItem.Facets.length; j++) {
                    if (dzTiles[i].facetItem.Facets[j].Name == orderBy && dzTiles[i].facetItem.Facets[j].FacetValues.length > 0) {

                        for (var m = 0; m < dzTiles[i].facetItem.Facets[j].FacetValues.length; m++) { 
                            var val = dzTiles[i].facetItem.Facets[j].FacetValues[m].Value;

                            var found = false;
                            for (var k = 0; k < bkts.length; k++) {
//this needs fixing to handle the whole range...
                                if (bkts[k].startRange == val) {
                                    // If item is not already in the bucket add it
                                    if ($.inArray(dzTiles[i].facetItem.Id, bkts[k].Ids) < 0)
                                        bkts[k].Ids.push(dzTiles[i].facetItem.Id);
                                    found = true;
                                }
                            }
                            if (!found)
                                bkts.push({ startRange: val, endRange: val, Ids: [dzTiles[i].facetItem.Id], Values: [val] });

                            hasValue = true;
                        }
                    }
                }
                //If not hasValue then add it as a (no info) item
                if (!hasValue) {
                    var val = "(no info)";
                    var found = false;
                    for (var k = 0; k < bkts.length; k++) {
                        if (bkts[k].startRange == val) {
                            bkts[k].Ids.push(dzTiles[i].facetItem.Id);
                            bkts[k].Values.push(val);
                            found = true;
                        }
                    }
                    if (!found)
                        bkts.push({ startRange: val, endRange: val, Ids: [dzTiles[i].facetItem.Id], Values: [val] });
                }
            }
        }

	// If orderBy is one of the string filters then only include buckets that are in the filter
	if ( stringFacets.length > 0 ) {
	    var sortIndex;
	    for ( var f = 0; f < stringFacets.length; f++ ) {
	        if ( stringFacets[f].facet == orderBy ) {
		    sortIndex = f;
		    break;
	        }
            }
	    if ( sortIndex != undefined  && sortIndex >= 0 ) {
	        var newBktsArray = [];
	        var filterValues = stringFacets[sortIndex].facetValue;
	        for ( var b = 0; b < bkts.length; b ++ ) {
		    var valueIndex = $.inArray(bkts[b].startRange, filterValues ); 
		    if (valueIndex >= 0 )
		        newBktsArray.push(bkts[b]);
	        }
	        bkts = newBktsArray;
	    }
	}

        var current = 0;
        while (bkts.length > 8) {
            if (current < bkts.length - 1) {
                bkts[current].endRange = bkts[current + 1].endRange;
                for (var i = 0; i < bkts[current + 1].Ids.length; i++) {
                    if ($.inArray(bkts[current+1].Ids[i], bkts[current].Ids) < 0) 
                        bkts[current].Ids.push(bkts[current + 1].Ids[i]);
                        if ($.inArray(bkts[current + 1].endRange, bkts[current].Values) < 0) 
                            bkts[current].Values.push(bkts[current + 1].endRange);
                }
                bkts.splice(current + 1, 1);
                current++;
            } else
                current = 0;
        }

        return bkts;
    },
    // These need fixing
    GetSelectedCol: function (tile, bucket) {
        var that = this;
        var selectedLoc = 0;
        for (i = 0; i < bucket; i++) {
          if ($.inArray(tile.facetItem.Id, this.buckets[i].Ids) > 0)
            selectedLoc++;
        }
        //var selectedLoc = tile.selectedLoc;
        //Need to account for padding in each column...
        padding = that.rowscols.PaddingX;
        colsInBar = that.rowscols.Columns;
        tileMaxWidth = that.rowscols.TileMaxWidth;
        selectedBar = Math.floor((tile._locations[selectedLoc].x - that.currentOffsetX) / ((tileMaxWidth * colsInBar) + padding));
        selectedColInBar = Math.round(((tile._locations[selectedLoc].x - that.currentOffsetX) - (selectedBar * (colsInBar * tileMaxWidth + padding))) / tileMaxWidth);
        selectedCol = (selectedBar * colsInBar) + selectedColInBar;
        return selectedCol;
    },
    GetSelectedRow: function (tile, bucket) {
        var that = this;
        var selectedLoc = 0;
        for (i = 0; i < bucket; i++) {
          if ($.inArray(tile.facetItem.Id, this.buckets[i].Ids) > 0)
            selectedLoc++;
        }
        //var selectedLoc = tile.selectedLoc;
        selectedRow = Math.round((that.canvasHeightUIAdjusted - (tile._locations[selectedLoc].y - that.currentOffsetY)) / tile.height);
        return selectedRow;
    },
    /// Centres the selected tile
    CentreOnSelectedTile: function (selectedCol, selectedRow) {
        var that = this;
        var selectedTile;
        for (var i = 0; i < that.tiles.length; i++) {
            if (that.tiles[i].IsSelected()) {
                selectedTile = that.tiles[i];
                break;
            }
        }

        //var rowscols = that.GetRowsAndColumns(that.columnWidth - 2, that.canvasHeightUIAdjusted, that.maxRatio, that.bigCount);
        that.rowscols = that.GetRowsAndColumns(that.columnWidth - 2, that.canvasHeightUIAdjusted, that.maxRatio, that.bigCount);
        if (that.rowscols.TileHeight < 10 ) that.rowscols.TileHeight = 10;
        var bucket = Math.floor(selectedCol/ that.rowscols.Columns);
        var padding = that.rowscols.PaddingX * bucket;

        that.currentOffsetX = ((that.rowscols.TileMaxWidth * selectedCol) * -1) + (that.width / 2) - (that.rowscols.TileMaxWidth / 2) - padding;

        //that.currentOffsetY = rowscols.TileHeight * (selectedRow - 1) - (that.canvasHeightUIAdjusted / 2) - (rowscols.TileHeight / 2);  
        that.currentOffsetY = - that.rowscols.TileHeight * ((that.rowscols.Rows / 2) - (selectedRow + 1)) - ( that.canvasHeightUIAdjusted / 2 ) - (that.rowscols.TileHeight / 2);

        that.SetVisibleTileGraphPositions(that.rowscols, that.currentOffsetX, that.currentOffsetY, true, true);
    },
    handleSelection: function (selectedItem, selectedTile, clickX, selectedLoc) {
        var that = this;
            var selectedCol = 0;
            var selectedRow = 0;
            var found = false;
            var dontFilter = false;
            var offsetX = 0, offsetY = 0;

            //First get the position of the selected tile
            if ( selectedItem != null && selectedTile !=null) {
                //determine row and column that tile is in in relation to the first tile
                //Actual position not really row/column so different from similarly 
                //named variables in gridview.js
                selectedX = selectedTile._locations[selectedLoc].x;
                selectedY = selectedTile._locations[selectedLoc].y;
            }

            //Reset slider to zero before zooming ( do this before sorting the tile selection
            //because zooming to zero unselects everything...)
            if (selectedItem != null && that.selected != selectedItem) {
                if (that.selected == ""){
                    var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
                    if (value != 0)
                       $('.pv-toolbarpanel-zoomslider').slider('option', 'value', 0);
                }
            }

            if ( selectedItem != null && selectedTile !=null) {
                selectedTile.Selected(true);
                selectedTile.selectedLoc = selectedLoc;
                found = true;

                //Used for scaling and centering 
                //Need to account for paddingin each column...
                padding = that.rowscols.PaddingX;
                colsInBar = that.rowscols.Columns;
                tileMaxWidth = that.rowscols.TileMaxWidth;
                selectedBar = Math.floor((selectedTile._locations[selectedLoc].x - that.currentOffsetX) / ((selectedTile.width * colsInBar) + padding));
                selectedColInBar = Math.round(((selectedTile._locations[selectedLoc].x - that.currentOffsetX) - (selectedBar * (colsInBar * tileMaxWidth + padding))) / tileMaxWidth);
                selectedCol = (selectedBar * colsInBar) + selectedColInBar;
                selectedRow = Math.round((that.canvasHeightUIAdjusted - (selectedTile._locations[selectedLoc].y - that.currentOffsetY)) / selectedTile.height);
                tileHeight = selectedTile.height;
                tileWidth = selectedTile.height / selectedTile._controller.GetRatio(selectedTile.facetItem.Img);
                tileOrigHeight = selectedTile.origheight;
                tileOrigWidth = selectedTile.origwidth;
                canvasHeight = selectedTile.context.canvas.height
                canvasWidth = selectedTile.context.canvas.width - ($('.pv-filterpanel').width() + $('.pv-infopanel').width());
            }

            // If an item is selected then zoom out but don't set the filter
            // based on clicking in a bar in the graph.
            if (that.selected != null && that.selected != "" && !found)
               dontFilter = true;

            //zoom in on selected tile
            if (selectedItem != null && that.selected != selectedItem) {
                // Find which is proportionally bigger, height or width
                if (tileHeight / canvasHeight > tileWidth/canvasWidth) 
                    origProportion = tileOrigHeight / canvasHeight;
                else
                    origProportion = tileOrigWidth / canvasWidth;
                //Get scaling factor so max tile dimension is about 60% total
                //Multiply by two as the zoomslider devides all scaling factors by 2
                scale = Math.round((0.75 / origProportion) * 2);

                // Zoom using the slider event
                if (that.selected == ""){
                    var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
                    value = scale; 
                    $('.pv-toolbarpanel-zoomslider').slider('option', 'value', value);
                }
                that.selected = selectedItem;
                that.CentreOnSelectedTile(selectedCol, selectedRow);

// Also need to scale the backgound colums...
// leave for now - tricky

              //  if (that.width < that.height) {
              //      var newWidth = that.width * that.rowscols.Columns * 0.6; //0.6 to leave 10% space
              //      var newHeight = (that.canvasHeightUIAdjusted / that.width) * newWidth;
              //  } else {
              //      var newHeight = that.canvasHeightUIAdjusted * that.rowscols.Rows * 0.6;
              //      var newWidth = (that.width / that.canvasHeightUIAdjusted) * newHeight;
              //  }

            //    var scaleY = newHeight / that.canvasHeightUIAdjusted;
            //    var scaleX = newWidth / (that.width - that.offsetX);
            //    that.columnWidth = newWidth / that.buckets.length;
//                that.columnWidth = that.currentWidth / that.buckets.length;

                //var rowscols = that.GetRowsAndColumns(that.columnWidth, newHeight, that.maxRatio, that.bigCount);
//                var rowscols = that.GetRowsAndColumns(that.columnWidth, that.currentHeight, that.maxRatio, that.bigCount);

                //that.currentOffsetX = -((selectedCol - that.offsetX) * scaleX) + (that.width / 2) - (rowscols.TileMaxWidth / 2);
 //               that.currentOffsetX = -((selectedCol) * (that.currentWidth/that.width)) - that.currentOffsetX + (that.width / 2) - (rowscols.TileMaxWidth / 2);

//                var rowNumber = Math.ceil((that.canvasHeightUIAdjusted - selectedRow) / that.rowscols.TileHeight);
//                that.currentOffsetY = 31 + (rowscols.TileHeight * (rowNumber - 1)l* that.currentWidth/that.width);

//                that.SetVisibleTileGraphPositions(rowscols, that.currentOffsetX, that.currentOffsetY, true, true);
                $('.pv-viewarea-graphview-overlay div').fadeOut('slow');
            } else {
                that.selected = selectedItem = "";
                selectedBar = 0;
                //zoom out
                that.currentOffsetX = that.offsetX;
                that.currentOffsetY = that.offsetY;

                // Zoom using the slider event
                var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
                value = 0; 
                $('.pv-toolbarpanel-zoomslider').slider('option', 'value', value);

                $('.pv-viewarea-graphview-overlay div').fadeIn('slow');
            }
             $.publish("/PivotViewer/Views/Item/Selected", [{id: selectedItem, bkt: selectedBar}]);

        if (!found && !dontFilter) {
            var bucketNumber = Math.floor((clickX - that.offsetX) / that.columnWidth);
            $.publish("/PivotViewer/Views/Item/Filtered", [{ Facet: that.sortFacet, Item: that.buckets[bucketNumber].startRange, MaxRange: that.buckets[bucketNumber].endRange, Values: that.buckets[bucketNumber].Values, ClearFacetFilters:true}]);
        }
    },
    SetFacetCategories: function (collection) {
        this.categories = collection.FacetCategories;
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///
/// Grid view
///
PivotViewer.Views.GridView = PivotViewer.Views.TileBasedView.subClass({
    init: function () {
        this.Scale = 1;
        this._super();
        this.dontZoom = false;
        var that = this;
        //Event Handlers

        $.subscribe("/PivotViewer/Views/Canvas/Click", function (evt) {
            if (!that.isActive)
                return;

            var selectedItem = null;
            var selectedTile = null;
            for (var i = 0; i < that.tiles.length; i++) {
                var loc = that.tiles[i].Contains(evt.x, evt.y);
                if ( loc >= 0 ) {
                    selectedTile = that.tiles[i];
                    selectedItem = that.tiles[i].facetItem.Id;
                } else {
                    that.tiles[i].Selected(false);
                }
            }
	    that.handleSelection (selectedItem, selectedTile);
	});

        $.subscribe("/PivotViewer/Views/Canvas/Hover", function (evt) {
            if (!that.isActive || that.selected.length > 0)
                return;

            for (var i = 0; i < that.tiles.length; i++) {
                var loc = that.tiles[i].Contains(evt.x, evt.y); 
                if ( loc >= 0 )
                    that.tiles[i].Selected(true);
                else
                    that.tiles[i].Selected(false);
            }
        });

        $.subscribe("/PivotViewer/Views/Canvas/Zoom", function (evt) {
            if (!that.isActive)
                return;

            if (that.dontZoom) {
                that.dontZoom = false;
                return;
            }

            var oldScale = that.Scale;
            var preWidth = that.currentWidth;
            var preHeight = that.currentHeight;
            //Set the zoom time - the time it takes to zoom to the scale
            //if on a touch device where evt.scale != undefined then have no delay
            var zoomTime = evt.scale != undefined ? 0 : 1000;
                        
            if (evt.scale != undefined) {
                if (evt.scale >= 1)
                    that.Scale += (evt.scale - 1);
                else {
                    that.Scale -= evt.scale;
                    that.Scale = that.Scale < 1 ? 1 : that.Scale;
                }
            } else if (evt.delta != undefined)
                that.Scale = evt.delta == 0 ? 1 : (that.Scale + evt.delta - 1);

            if (that.Scale == NaN)
                that.Scale = 1;

            var newWidth = (that.width - that.offsetX) * that.Scale;
            var newHeight = (that.height - that.offsetY) * that.Scale;



            //if trying to zoom out too far, reset to min
            if (newWidth < that.width || that.Scale == 1) {
                that.currentOffsetX = that.offsetX;
                that.currentOffsetY = that.offsetY;
                that.currentWidth = that.width;
                that.currentHeight = that.height;
                that.Scale = 1;
                // Reset the slider to zero 
                that.dontZoom = true;
                $('.pv-toolbarpanel-zoomslider').slider('option', 'value', 0);
            } else {
                //adjust position to base scale - then scale out to new scale
                var scaledPositionX = ((evt.x - that.currentOffsetX) / oldScale) * that.Scale;
                var scaledPositionY = ((evt.y - that.currentOffsetY) / oldScale) * that.Scale;

                //Move the scaled position to the mouse location
                that.currentOffsetX = evt.x - scaledPositionX;
                that.currentOffsetY = evt.y - scaledPositionY;
                that.currentWidth = newWidth;
                that.currentHeight = newHeight;
            }

            var rowscols = that.GetRowsAndColumns(that.currentWidth - that.offsetX, that.currentHeight - that.offsetY, that.maxRatio, that.currentFilter.length);
            that.SetVisibleTilePositions(rowscols, that.currentFilter, that.currentOffsetX, that.currentOffsetY, true, true, zoomTime);

            //deselect tiles if zooming back to min size
            if (that.Scale == 1 && oldScale != 1) {
                for (var i = 0; i < that.tiles.length; i++) {
                    that.tiles[i].Selected(false);
                }
                that.selected = "";
                $.publish("/PivotViewer/Views/Item/Selected", [{id: that.selected, bkt: 0}]);
            }
        });

        $.subscribe("/PivotViewer/Views/Canvas/Drag", function (evt) {
            if (!that.isActive)
                return;

            var dragX = evt.x;
            var dragY = evt.y;
            var noChangeX = false, noChangeY = false;
            that.currentOffsetX += dragX;
            that.currentOffsetY += dragY;

            //LHS bounds check
            if (dragX > 0 && that.currentOffsetX > that.offsetX) {
                that.currentOffsetX -= dragX;
                noChangeX = true;
            }
            //Top bounds check
            if (dragY > 0 && that.currentOffsetY > that.offsetY) {
                that.currentOffsetY -= dragY;
                noChangeY = true;
            }
            //RHS bounds check
            //if the current offset is smaller than the default offset and the zoom scale == 1 then stop drag
            if (that.currentOffsetX < that.offsetX && that.currentWidth == that.width) {
                that.currentOffsetX -= dragX;
                noChangeX = true;
            }
            if (dragX < 0 && (that.currentOffsetX) < -1 * (that.currentWidth - that.width)) {
                that.currentOffsetX -= dragX;
                noChangeX = true;
            }
            //bottom bounds check
            if (that.currentOffsetY < that.offsetY && that.currentHeight == that.height) {
                that.currentOffsetY -= dragY;
                noChangeY = true;
            }
            if (dragY < 0 && (that.currentOffsetY - that.offsetY) < -1 * (that.currentHeight - that.height)) {
                that.currentOffsetY -= dragY;
                noChangeY = true;
            }

            if (noChangeX && noChangeY)
                return;
            if (noChangeX)
                that.OffsetTiles(0, dragY);
            else if (noChangeY)
                that.OffsetTiles(dragX, 0);
            else
                that.OffsetTiles(dragX, dragY);
        });
    },
    Setup: function (width, height, offsetX, offsetY, tileMaxRatio) {
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.maxRatio = tileMaxRatio;
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        this.currentOffsetX = this.offsetX;
        this.currentOffsetY = this.offsetY;
    },
    Filter: function (dzTiles, currentFilter, sortFacet, stringFacets, changingView, changeViewSelectedItem) {
        var that = this;
        var changingFromNonTileView = false;
        if (!Modernizr.canvas)
            return;

        PivotViewer.Debug.Log('Grid View Filtered: ' + currentFilter.length);

        this.changingView = false;
        if (changingView) {
            if ($('.pv-tableview-table').is(':visible')){
                changingFromNonTileView = true;
                $('.pv-tableview-table').fadeOut();
                //this.selected = changeViewSelectedItem;
                this.selected = "";
                $('.pv-toolbarpanel-zoomslider').fadeIn();
                $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                $('.pv-viewarea-canvas').fadeIn(function(){
                    $.publish("/PivotViewer/Views/ChangeTo/Grid", [{Item: changeViewSelectedItem}]);
                });
            }
            if ($('.pv-mapview-canvas').is(':visible')){
                changingFromNonTileView = true;
                $('.pv-toolbarpanel-maplegend').fadeOut(400, function(){
                    $('.pv-toolbarpanel-zoomslider').fadeIn();
                    $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                });
                $('.pv-mapview-legend').hide('slide', {direction: 'up'});
                $('.pv-mapview-canvas').fadeOut();
                this.selected = "";
                $('.pv-viewarea-canvas').fadeIn(function(){
                    $.publish("/PivotViewer/Views/ChangeTo/Grid", [{Item: changeViewSelectedItem}]);
                });
            }
            if ($('.pv-timeview-canvas').is(':visible')){
                changingFromNonTileView = true;
                $('.pv-timeview-canvas').fadeOut();
                this.selected = "";
                $('.pv-toolbarpanel-timelineselector').fadeOut();
                $('.pv-toolbarpanel-maplegend').fadeOut();
                $('.pv-toolbarpanel-sort').fadeIn();
                $('.pv-toolbarpanel-zoomslider').fadeIn();
                $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                $('#MAIN_BODY').css('overflow', 'auto');
                $('.pv-viewarea-canvas').fadeIn(function(){
                    $.publish("/PivotViewer/Views/ChangeTo/Grid", [{Item: changeViewSelectedItem}]);
                });
            }
            if ($('.pv-mapview2-canvas').is(':visible')){
                changingFromNonTileView = true;
                $('.pv-mapview2-canvas').fadeOut();
                this.selected = "";
                $('.pv-toolbarpanel-zoomslider').fadeIn();
                $('.pv-toolbarpanel-zoomcontrols').css('border-width', '1px');
                $('.pv-viewarea-canvas').fadeIn(function(){
                    $.publish("/PivotViewer/Views/ChangeTo/Grid", [{Item: changeViewSelectedItem}]);
                });
            }
        }

        this.tiles = dzTiles;
        if (this.init) {
            this.SetInitialTiles(this.tiles, this.width, this.height);
        }

        // Clear all the multiple images that are used in the grid view
        for (var l = 0; l < this.tiles.length; l++) {
          while (this.tiles[l]._locations.length > 1) 
              this.tiles[l]._locations.pop();   
        }
        // Ensure any selected location is zero
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].selectedLoc = 0;
        }

        //Sort
        this.tiles = this.tiles.sort(this.SortBy(sortFacet, false, function (a) {
            return $.isNumeric(a) ? a : a.toUpperCase();
        }, stringFacets));
        this.currentFilter = currentFilter;

        // Don't calculate positions if changing from table view with item already selected
        if (!changingFromNonTileView || (changeViewSelectedItem == "")) {
            var pt1Timeout = 0;
            //zoom out first
            PivotViewer.Debug.Log("this.currentWidth: " + this.currentWidth + " this.width: " + this.width);
              var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
              if (value > 0) { 
                this.selected = selectedItem = "";
                //zoom out
                this.currentOffsetX = this.offsetX;
                this.currentOffsetY = this.offsetY;
                // Zoom using the slider event
                $('.pv-toolbarpanel-zoomslider').slider('option', 'value', 1);
                var rowscols = this.GetRowsAndColumns(this.currentWidth - this.offsetX, this.currentHeight - this.offsetY, this.maxRatio, this.tiles.length);
                var clearFilter = [];
                for (var i = 0; i < this.tiles.length; i++) {
                    this.tiles[i].origwidth = rowscols.TileHeight / this.tiles[i]._controller.GetRatio(this.tiles[i].facetItem.Img);
                    this.tiles[i].origheight = rowscols.TileHeight;
                    clearFilter.push(this.tiles[i].facetItem.Id);
                }
                this.SetVisibleTilePositions(rowscols, clearFilter, this.currentOffsetX, this.currentOffsetY, true, false, 1000);
                pt1Timeout = 1000;
            }
 
            setTimeout(function () {
                for (var i = 0; i < that.tiles.length; i++) {
                    //setup tiles
                    that.tiles[i]._locations[0].startx = that.tiles[i]._locations[0].x;
                    that.tiles[i]._locations[0].starty = that.tiles[i]._locations[0].y;
                    that.tiles[i].startwidth = that.tiles[i].width;
                    that.tiles[i].startheight = that.tiles[i].height;
 
                    var filterindex = $.inArray(that.tiles[i].facetItem.Id, currentFilter);
                    //set outer location for all tiles not in the filter
                    if (filterindex < 0) {
                        that.SetOuterTileDestination(that.width, that.height, that.tiles[i]);
                        that.tiles[i].start = PivotViewer.Utils.Now();
                        that.tiles[i].end = that.tiles[i].start + 1000;
                    }
                }
 
                // recalculate max width of images in filter
                that.maxRatio = that.tiles[0]._controller.GetRatio(that.tiles[0].facetItem.Img);
                for (var i = 0; i < that.tiles.length; i++) {
                    var filterindex = $.inArray(that.tiles[i].facetItem.Id, currentFilter);
                    if (filterindex >= 0) {
                        if (that.tiles[i]._controller.GetRatio(that.tiles[i].facetItem.Img) < that.maxRatio)
                            that.maxRatio = that.tiles[i]._controller.GetRatio(that.tiles[i].facetItem.Img);
                    }
                }
 
                var pt2Timeout = currentFilter.length == that.tiles.length ? 0 : 500;
                //Delay pt2 animation
                setTimeout(function () {
                    var rowscols = that.GetRowsAndColumns(that.width - that.offsetX, that.height - that.offsetY, that.maxRatio, that.currentFilter.length);
                    for (var i = 0; i < that.tiles.length; i++) {
                        that.tiles[i].origwidth = rowscols.TileHeight / that.tiles[i]._controller.GetRatio(that.tiles[i].facetItem.Img);
                        that.tiles[i].origheight = rowscols.TileHeight;
                    }
                    that.SetVisibleTilePositions(rowscols, that.currentFilter, that.offsetX, that.offsetY, false, false, 1000);
                }, pt2Timeout);
 
            }, pt1Timeout);
        }

        this.init = false;
    },
    GetUI: function () {
        if (Modernizr.canvas)
            return "";
        else
            return "<div class='pv-viewpanel-unabletodisplay'><h2>Unfortunately this view is unavailable as your browser does not support this functionality.</h2>Please try again with one of the following supported browsers: IE 9+, Chrome 4+, Firefox 2+, Safari 3.1+, iOS Safari 3.2+, Opera 9+<br/><a href='http://caniuse.com/#feat=canvas'>http://caniuse.com/#feat=canvas</a></div>";
    },
    GetButtonImage: function () {
        return 'images/GridView.png';
    },
    GetButtonImageSelected: function () {
        return 'images/GridViewSelected.png';
    },
    GetViewName: function () {
        return 'Grid View';
    },
    /// Sets the tiles position based on the GetRowsAndColumns layout function
    SetVisibleTilePositions: function (rowscols, filter, offsetX, offsetY, initTiles, keepColsRows, miliseconds) {
        //re-use previous columns
        var columns = (keepColsRows && this.rowscols)  ? this.rowscols.Columns : rowscols.Columns;
        if (!keepColsRows)
            this.rowscols = rowscols;

        var currentColumn = 0;
        var currentRow = 0;
        for (var i = 0; i < this.tiles.length; i++) {
            var filterindex = $.inArray(this.tiles[i].facetItem.Id, filter);
            if (filterindex >= 0) {
                if (initTiles) {
                    //setup tile initial positions
                    this.tiles[i]._locations[0].startx = this.tiles[i]._locations[0].x;
                    this.tiles[i]._locations[0].starty = this.tiles[i]._locations[0].y;
                    this.tiles[i].startwidth = this.tiles[i].width;
                    this.tiles[i].startheight = this.tiles[i].height;
                }

                //set destination positions
                this.tiles[i].destinationwidth = rowscols.TileMaxWidth;
                this.tiles[i].destinationheight = rowscols.TileHeight;
                this.tiles[i]._locations[0].destinationx = (currentColumn * rowscols.TileMaxWidth) + offsetX;
                this.tiles[i]._locations[0].destinationy = (currentRow * rowscols.TileHeight) + offsetY;
                this.tiles[i].start = PivotViewer.Utils.Now();
                this.tiles[i].end = this.tiles[i].start + miliseconds;
                if (currentColumn == columns - 1) {
                    currentColumn = 0;
                    currentRow++;
                }
                else
                    currentColumn++;
            }
        }
    },
    GetSelectedCol: function (tile) {
        var that = this;
        selectedCol = Math.round((tile._locations[0].x - that.currentOffsetX) / tile.width); 
        return selectedCol;
    },
    GetSelectedRow: function (tile) {
        var that = this;
        selectedRow = Math.round((tile._locations[0].y - that.currentOffsetY) / tile.height);
        return selectedRow;
    },
    /// Centres the selected tile
    CentreOnSelectedTile: function (selectedCol, selectedRow) {
        var that = this;
        var selectedTile; 
        for (var i = 0; i < that.tiles.length; i++) {
            if (that.tiles[i].IsSelected()) {
                selectedTile = that.tiles[i];   
                break;
            }
        }
        var rowscols = that.GetRowsAndColumns(that.currentWidth - that.offsetX, that.currentHeight - that.offsetY, that.maxRatio, that.currentFilter.length);

        that.currentOffsetX = ((rowscols.TileMaxWidth * selectedCol) * -1) + (that.width / 2) - (rowscols.TileMaxWidth / 2);
        that.currentOffsetY = ((rowscols.TileHeight * selectedRow) * -1) + (that.height / 2) - (rowscols.TileHeight / 2);
        that.SetVisibleTilePositions(rowscols, that.currentFilter, that.currentOffsetX, that.currentOffsetY, true, true, 1000);
    },
    handleSelection: function (selectedItem, selectedTile) {
        var that = this;
        var selectedCol = 0;
        var selectedRow = 0;
        var offsetX = 0, offsetY = 0;
 
        //First get the row and column of the selected tile
        if ( selectedItem != null && selectedTile !=null) {
            //determine row and column that tile is in in relation to the first tile
            selectedCol = Math.round((selectedTile._locations[0].x - that.currentOffsetX) / selectedTile.width);
            selectedRow = Math.round((selectedTile._locations[0].y - that.currentOffsetY) / selectedTile.height);
        }

        //Reset slider to zero before zooming ( do this before sorting the tile selection
        //because zooming to zero unselects everything...)
        if (selectedItem != null && that.selected != selectedItem) {
            if (that.selected == ""){
                var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
                if (value != 0)
                   $('.pv-toolbarpanel-zoomslider').slider('option', 'value', 0);
            }
        }

        if ( selectedItem != null && selectedTile !=null) {
            selectedTile.Selected(true);
            tileHeight = selectedTile.height;
            tileWidth = selectedTile.height / selectedTile._controller.GetRatio(selectedTile.facetItem.Img);
            tileOrigHeight = selectedTile.origheight;
            tileOrigWidth = selectedTile.origwidth;
            canvasHeight = selectedTile.context.canvas.height
            canvasWidth = selectedTile.context.canvas.width - ($('.pv-filterpanel').width() + $('.pv-infopanel').width());
        }

        //zoom in on selected tile
        if (selectedItem != null && that.selected != selectedItem) {
            // Find which is proportionally bigger, height or width
            if (tileHeight / canvasHeight > tileWidth/canvasWidth) 
                origProportion = tileOrigHeight / canvasHeight;
            else
                origProportion = tileOrigWidth / canvasWidth;
            //Get scaling factor so max tile dimension is about 60% total
            //Multiply by two as the zoomslider devides all scaling factors by 2
            scale = Math.round((0.75 / origProportion) * 2);

            // Zoom using the slider event
            if (that.selected == ""){
                var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
                value = scale; 
                $('.pv-toolbarpanel-zoomslider').slider('option', 'value', value);
            }
            that.selected = selectedItem;
            that.CentreOnSelectedTile(selectedCol, selectedRow);
        } else {
            that.selected = selectedItem = "";
            //zoom out
            that.currentOffsetX = that.offsetX;
            that.currentOffsetY = that.offsetY;
            // Zoom using the slider event
            var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
            value = 0;
            $('.pv-toolbarpanel-zoomslider').slider('option', 'value', value);
        }

        $.publish("/PivotViewer/Views/Item/Selected", [{id: selectedItem, bkt: 0}]);
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///Image Controller interface - all image handlers must implement this
PivotViewer.Views.IImageController = Object.subClass({
    init: function () { },
    Setup: function (basePath) { },
    GetImagesAtLevel: function (id, level) { },
    Width: 0,
    Height: 0
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

PivotViewer.Views.LoadImageSetHelper = Object.subClass({
    init: function () {
        this._images = [],
        this._loaded = false;
    },

    //Load an array of urls
    LoadImages: function (images) {
        var that = this;
        for (var i = 0; i < images.length; i++) {
            var img = new Image();
            img.src = images[i];
            img.onload = function () {
                that._loaded = true;
            };
            this._images.push(img);
        }
    },
    GetImages: function () { return this._images; },
    IsLoaded: function () { return this._loaded; }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///Map View
PivotViewer.Views.MapView = PivotViewer.Views.IPivotViewerView.subClass({
    init: function () {
        this._super();
        this.locCache = Array();
        this.locList = Array();
        this.inScopeLocList = Array();
        this.map; 
        this.markers = Array();
        this.overlay;
        this.overlayBaseImageUrl = "";
        this.selectedItemId;
        this.geocodeList = Array();
        this.itemsToGeocode = Array();
        this.startGeocode;
        this.geocodeZero;
        this.mapInitZoom = "";
        this.mapInitType = "";
        this.mapInitCentreX = "";
        this.mapInitCentreY = "";
        this.mapZoom = "";
        this.mapType = "";
        this.mapCentreX = "";
        this.mapCentreY = "";
        this.applyBookmark = false;
        this.geocodeService = "";
        this.geometryValue = "";
        this.areaValues = Array();
        this.areaObj;
        var that = this;
        this.buckets = [];
        this.iconFiles = [
            'http://maps.google.com/mapfiles/ms/icons/red.png',
            'http://maps.google.com/mapfiles/ms/icons/yellow.png',
            'http://maps.google.com/mapfiles/ms/icons/green.png',
            'http://maps.google.com/mapfiles/ms/icons/blue.png',
            'http://maps.google.com/mapfiles/ms/icons/purple.png',
            'http://maps.google.com/mapfiles/ms/icons/orange.png',
            'http://maps.google.com/mapfiles/ms/icons/pink.png',
            'http://maps.google.com/mapfiles/ms/icons/lightblue.png',
            'http://maps.google.com/mapfiles/ms/icons/grey.png'];
        this.iconFilesSelected = [
            'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png',
            'http://maps.google.com/mapfiles/ms/icons/grey-dot.png'];
    },
    Setup: function (width, height, offsetX, offsetY, tileMaxRatio) { 
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        this.currentOffsetX = this.offsetX;
        this.currentOffsetY = this.offsetY;
        // Check for local storage support
        if (Modernizr.localstorage)
            this.localStorage = true;
        else
            this.localStorage = false;
    },
    Filter: function (dzTiles, currentFilter, sortFacet, stringFacets, changingView, selectedItem) { 
        var that = this;
        var g = 0;  //keeps track of the no. of geocode locations;
        if (!Modernizr.canvas)
            return;

        PivotViewer.Debug.Log('Map View Filtered: ' + currentFilter.length);

        if (changingView) {
            $('.pv-viewarea-canvas').fadeOut();
            $('.pv-tableview-table').fadeOut();
            $('.pv-mapview2-canvas').fadeOut();
            $('.pv-timeview-canvas').fadeOut();
            $('.pv-toolbarpanel-sort').fadeIn();
            $('.pv-toolbarpanel-timelineselector').fadeOut();
            $('.pv-toolbarpanel-zoomslider').fadeOut();
            $('.pv-toolbarpanel-maplegend').fadeIn();
            if (!selectedItem)
                $('.pv-mapview-legend').show('slide', {direction: 'up'});
            $('.pv-toolbarpanel-zoomcontrols').css('border-width', '0');
            $('#MAIN_BODY').css('overflow', 'auto');
            $('.pv-mapview-canvas').fadeIn(function(){
                if (selectedItem)
                    $.publish("/PivotViewer/Views/Item/Selected", [{id: selectedItem.Id, bkt: 0}]);
            });
        }

        //Check for location information

        this.sortFacet = sortFacet;
        //this.tiles = dzTiles;
        this.currentFilter = currentFilter;
        this.selectedItemId = "";

        //Sort and bucketize so items can be grouped using coloured pins
        this.tiles = dzTiles.sort(this.SortBy(this.sortFacet, false, function (a) {
            return $.isNumeric(a) ? a : a.toUpperCase();
        }, stringFacets));

        this.buckets = this.Bucketize(dzTiles, currentFilter, this.sortFacet, stringFacets);

        //Empty the inScope item list
        this.inScopeLocList = [];        

        //Clear legend info in toolbar
        $('.pv-toolbarpanel-maplegend').empty();
        if (!changingView && !selectedItem) 
            $('.pv-mapview-legend').show('slide', {direction: 'up'});

        //Check for geometry facet
        //This should contain a geometry definition im WKT that applies to the whole collection
        //E.g. where a geometry filter has been applied
        var gotGeometry = false;
        for (var i = 0; i < currentFilter.length && !gotGeometry; i++) {
            for (var j = 0; j < this.tiles.length && !gotGeometry; j++) { 
                if (this.tiles[j].facetItem.Id == currentFilter[i]) {
                    for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++) {
                        if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("GEOMETRY") >= 0) {
                            //If multiple values just use the first one for now...
                            this.geometryValue = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                            gotGeometry = true;
                            break;
                        }
                    }
                }
            }
        }

        //Check for area facet
        //This should contain a geometry definition im WKT that applies to an individual item
        for (var i = 0; i < currentFilter.length; i++) {
            for (var j = 0; j < this.tiles.length; j++) { 
                if (this.tiles[j].facetItem.Id == currentFilter[i]) {
                    for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++) {
                        if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("AREA") >= 0) {
                            var areaValue = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                            this.areaValues.push({id: this.tiles[j].facetItem.Id, area: areaValue});
                            break;
                        }
                    }
                }
            }
        }

        //Create a list of in scope locations
        for (var i = 0; i < currentFilter.length; i++) {
            for (var j = 0; j < this.tiles.length; j++) { 
                if (this.tiles[j].facetItem.Id == currentFilter[i]) {
                    //Tile is in scope
                    var latitude;
                    var longitude;
                    var gotLatitude = false;
                    var gotLongitude = false;
                    var gotLocation = false;
                    var inCache = false;
                    var itemId = this.tiles[j].facetItem.Id;
                    var itemName = this.tiles[j].facetItem.Name;

                    //Have we cached the item location?
                    for (var c = 0; c < this.locList.length; c ++) {
                        if (this.locList[c].id == itemId) {
                            if (this.locList[c].loc.lat() != 0 || this.locList[c].loc.lng() != 0) 
                                this.inScopeLocList.push(this.locList[c]);
                            inCache = true;
                            break;
                        }
                    }
             
                    if (!inCache) {
                        //First try to get co-ordinate information from the facets
                        for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++) {
                            if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("LATITUDE") >= 0) {
                                //If multiple values just use the first one for now...
                                var facetType = this.GetFacetCategoryType (this.tiles[j].facetItem.Facets[k].Name);
                                if (facetType == "String")
                                  latitude = parseFloat(this.tiles[j].facetItem.Facets[k].FacetValues[0].Value);
                                else if (facetType == "Number") 
                                  latitude = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                                else
                                  break;
                                gotLatitude = true;
                                if (gotLongitude) {
                                    var newLoc = new google.maps.LatLng(latitude, longitude);
                                    this.locList.push({id: itemId, loc: newLoc, title: itemName});
                                    this.inScopeLocList.push({id: itemId, loc: newLoc, title: itemName});
                                    gotLocation = true;
                                    break;
                                }
                            }
                            else if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("LONGITUDE") >= 0) {
                                var facetType = this.GetFacetCategoryType (this.tiles[j].facetItem.Facets[k].Name);
                                if (facetType == "String")
                                  longitude = parseFloat(this.tiles[j].facetItem.Facets[k].FacetValues[0].Value);
                                else if (facetType == "Number") 
                                  longitude = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                                else
                                  break;
                                gotLongitude = true;
                                if (gotLatitude) {
                                    var newLoc = new google.maps.LatLng(latitude, longitude);
                                    this.locList.push({id: itemId, loc: newLoc, title: itemName});
                                    this.inScopeLocList.push({id: itemId, loc: newLoc, title: itemName});
                                    gotLocation = true;
                                    break;
                                }
                            }
                        }//loop through facets counter k
                        if (!gotLocation) {
                            //Look for specially named facet LOCATION
                            for (var f = 0; f < this.tiles[j].facetItem.Facets.length; f++) {
                               if (this.tiles[j].facetItem.Facets[f].Name.toUpperCase().indexOf("LOCATION") >= 0) {
                                   //go through the values 
                                   for (var v = 0; v < this.tiles[j].facetItem.Facets[f].FacetValues.length; v++) {
                                       var value = this.tiles[j].facetItem.Facets[f].FacetValues[v].Value;
                                       var invalidCoordinates = false;
                                  
                                       if (value.toUpperCase().indexOf("POINT(") == 0 ) {
                                           longitude = value.substring(7, value.indexOf(' ', 7));
                                           latitude  = value.substring(value.indexOf(' ', 7) + 1, value.indexOf(')', 7));
                                           if (latitude != "NaN" && longitude != "NaN") {
                                               var lat = parseFloat(latitude);
                                               var lon = parseFloat(longitude);
                                               if (!isNaN(lat) && ! isNaN(lon)) {
                                                   var newLoc = new google.maps.LatLng(lat, lon);
                                                   locList.push({id: itemId, loc: newLoc, title: itemName});
                                                   inScopeList.push({id: itemId, loc: newLoc, title: itemName});
                                                   gotLocation = true;
                                                   break;
                                               }
                                           } else
                                               invalidCoordinates = true;
                                       //at this point silverlight version checks for other stuff
                                       }  else if (value.indexOf(",") > -1 ) {
                                           //Could be a co-ordinate pair
                                           var lat = parseFloat(value.substring(0, value.indexOf(',')));
                                           var lon = parseFloat(value.substring(value.indexOf(',')));
                                           if (!isNaN(lat) && !isNaN(lon)) {
                                               //ok, have co-ordinate pair
                                               var newLoc = new google.maps.LatLng(lat, lon);
                                               locList.push({id: itemId, loc: newLoc, title: itemName});
                                               inScopeList.push({id: itemId, loc: newLoc, title: itemName});
                                               gotLocation = true;
                                               break;
                                           } else
                                               invalidCoordinates = true;
                                      }
                                      if (!invalidCoordinates) {
                                          //If we get here then we still have not got a location
                                          //So try geocoding a location name
                                  
                                          // Quick check - is the place more than 1 char long
                                          if (value.length > 1) {
                                              // Note: replace all _ with a space
                                              var geoLoc = value.replace('_', ' ').toUpperCase();
                                  
                                              // First add region and country to the location.
                                              for (var r = 0; r < this.tiles[j].facetItem.Facets.length; r++) {
                                                  if (this.tiles[j].facetItem.Facets[r].Name.toUpperCase().indexOf("REGION") >= 0) {
                                                      var region = this.tiles[j].facetItem.Facets[r].FacetValues[0].Value;
                                                      if (region.length > 1)
                                                          geoLoc = geoLoc + ", " + region.replace('_', ' ').toUpperCase();
                                                      break;
                                                  }
                                              }
                                  
                                              for (var s = 0; s < this.tiles[j].facetItem.Facets.length; s++) {
                                                  if (this.tiles[j].facetItem.Facets[s].Name.toUpperCase().indexOf("COUNTRY") >= 0) {
                                  
                                                      var country = this.tiles[j].facetItem.Facets[s].FacetValues[0].Value;
                                                      if (country.length > 1)
                                                          geoLoc = geoLoc + ", " + country.replace('_', ' ').toUpperCase();
                                                      break;
                                                  }
                                              }
                                  
                                              // Is it in the cache?
                                              for (var l = 0; l < this.locCache.length; l++) {
                                                  if (this.locCache[l].locName == geoLoc) {
                                  
                                                      this.locList.push({id: itemId, loc: this.locCache[l].loc, title: itemName});
                                                      this.inScopeLocList.push({id: itemId, loc: this.locCache[l].loc, title: itemName});
                                                      gotLocation = true;
                                                      break;
                                                  }
                                              }

                                              if (!gotLocation) {
                                                  // Now try the users persistent cache
                                                  if (this.localStorage) {
                                                      var newLatLng;
                                                      var newLoc = JSON.parse(localStorage.getItem(geoLoc));
                                                      if (newLoc) {
                                                          var lat = parseFloat(newLoc.lat);
                                                          var lng = parseFloat(newLoc.lng);
                                                          if (!NaN(lat) && !NaN(lng)) {
                                                              newLatLng = new google.maps.LatLng(lat, lng);
                                                              // Add it to local cache
                                                              this.locCache.push({locName: geoLoc, loc: newLatLng});
                                                              this.locList.push({id: itemId, loc: newLatLng, title: itemName});
                                                              this.inScopeLocList.push({id: itemId, loc: newLatLng, title: itemName});
                                                              gotLocation = true;
                                                          }
                                                      }
                                                  }
                                                  if (!gotLocation) {
                                                      // Not in local or persistent cache so will have to use geocode service
                                                      // Add location to list for geocoding (will need to keep itemId name with it)
                                                      if (g < 1000) {//limiting the number of items to geocode at once to 1000 for now
                                                          var foundIt = false;
                                                          for (var gl = 0; gl < this.geocodeList.length; gl++) {
                                                              if (this.geocodeList[gl] == geoLoc) {
                                                                  foundIt = true;
                                                                  break;
                                                              }
                                                          }
                                                          if (!foundIt) {
                                                            this.geocodeList.push(geoLoc);
                                                            g++;
                                                          }
                                                          this.itemsToGeocode.push({id: itemId, locName: geoLoc, title:itemName});
                                                          gotLocation = true;
                                                          break;
                                                      }
                                                  } // Not in persistent geocode cache
                                              } // Not in in-memory geocode cache
                                          } //Location name longr than 1
                                       } //Not invalid co-ordinates 
                                   } //Go through location values v
                                   //Found a value in a location facet
                                   if (gotLocation)
                                       break;
                               }// Facet is LOCATION
                            } //loop through facets f
                        } //Not got co-ordinate - will need to geocode
                    } //Item i already has location 
                } //Tile j matches filter item i
            } //Tiles j
        } //Items in the filter i

        //Check that at least one in scope item has a location
        if (this.inScopeLocList.length == 0 && g == 0) {
            this.ShowMapError();
            return;
        } else if (g > 0 ){
            //Now do the geocoding
            this.GetLocationsFromNames();
        } //else {
            $('.pv-mapview-canvas').css('height', this.height - 12 + 'px');
            $('.pv-mapview-canvas').css('width', this.width - 415 + 'px');
            if (selectedItem)
                this.CreateMap(selectedItem.Id);
            else
                this.CreateMap("");
        //}
    },
    GetUI: function () { return ''; },
    GetButtonImage: function () {
        return 'images/MapView.png';
    },
    GetButtonImageSelected: function () {
        return 'images/MapViewSelected.png';
    },
    GetViewName: function () { return 'Map View'; },
    MakeGeocodeCallBack: function(locName) {
        var that = this;
        if (this.geocodeService == "Google"){
            var geocodeCallBack = function(results, status) {
                var dummy = new google.maps.LatLng(0, 0);
                var loc = dummy;
                
                if (status == google.maps.GeocoderStatus.OK) 
                    var loc = results[0].geometry.location;
                else 
                    var loc = dummy;

                // Add to local cache
                that.locCache.push ({locName: locName, loc: loc});
       
                // Add to persistent cache
                if (this.localStorage) {
                    var newLoc = {
                        lat: loc.lat(),
                        lng: loc.lng()
                    };
                    localStorage.setItem(locName, JSON.stringify(newLoc));
                }
       
                // Find items that have that location
                for (var i = 0; i < that.itemsToGeocode.length; i++ ) {
                    var itemId = that.itemsToGeocode[i].id;
                    var value = that.itemsToGeocode[i].locName;
                    var title = that.itemsToGeocode[i].title;
                    if (value == locName) {
                        that.locList.push({id: itemId, loc:loc, title: title});
                        if (loc.lat() != 0 || loc.lng() != 0)
                             that.inScopeLocList.push({id:itemId, loc:loc, title: title});
                    }
                }
       
                var doneGeocoding = true;
                for (var g = 0; g < that.geocodeList.length; g++) {
                    var value = that.geocodeList[g];
                    var currentLocNotFound = true;
                    for (var c = 0; c < that.locCache.length; c++) {
                        if (that.locCache[c].locName == value) {
                            currentLocNotFound = false;
                            break;
                        }
                    }
                    if (currentLocNotFound) {
                       doneGeocoding = false;
                       break;
                   }
                }
                // If geocoding has taken more than 20 secs then try to set
                // the bookmark.  Otherwise, if the time taken is more than 
                // 2 secs make the pins we have so far
                var now = new Date();
                if ((now.getTime() - that.geocodeZero.getTime())/1000 > 20) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.startGeocode = new Date();
                } else if ((now.getTime() - that.startGeocode.getTime())/1000 > 2) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.RefitBounds();
        	    that.GetOverlay();
                    that.startGeocode = new Date();
                }
       
                // If the geocodeResults array is totally filled, make the pins.
                if (doneGeocoding || that.geocodeList.Count == 0)
                {
                   //change cursor back ?
                   that.geocodeList = [];
                   if (that.inScopeLocList.Count == 0) {
                       this.ShowMapError();
                       return;
                   } else {
                       that.CreateMap(that.selectedItemId);
                       if (that.applyBookmark) {
                           that.SetBookmark();
                           that.applyBookmark = false;
                       }
                   }
               }
            }
        } else {
            var geocodeCallBack = function(xml) {
                //var dummy = new L.LatLng(0, 0);
                var dummy = new google.maps.LatLng(0, 0);
                var loc = dummy;
                var results = $(xml).find("searchresults");
                var place = $(xml).find("place");
 
                if (place) {
                    var lat = $(place).attr("lat");
                    var lon = $(place).attr("lon");
                    if (lat && lon)
                      loc = new google.maps.LatLng(lat, lon);
                }

                // Add to local cache
                that.locCache.push ({locName: locName, loc: loc});
       
                // Add to persistent cache
                if (this.localStorage) {
                    var newLoc = {
                        lat: loc.lat(),
                        lng: loc.lng()
                    };
                    localStorage.setItem(locName, JSON.stringify(newLoc));
                }
       
                // Find items that have that location
                for (var i = 0; i < that.itemsToGeocode.length; i++ ) {
                    var itemId = that.itemsToGeocode[i].id;
                    var value = that.itemsToGeocode[i].locName;
                    var title = that.itemsToGeocode[i].title;
                    if (value == locName) {
                        that.locList.push({id: itemId, loc:loc, title: title});
                        if (loc.lat() != 0 || loc.lng() != 0)
                             that.inScopeLocList.push({id:itemId, loc:loc, title: title});
                    }
                }
       
                var doneGeocoding = true;
                for (var g = 0; g < that.geocodeList.length; g++) {
                    var value = that.geocodeList[g];
                    var currentLocNotFound = true;
                    for (var c = 0; c < that.locCache.length; c++) {
                        if (that.locCache[c].locName == value) {
                            currentLocNotFound = false;
                            break;
                        }
                    }
                    if (currentLocNotFound) {
                       doneGeocoding = false;
                       break;
                   }
                }
                // If geocoding has taken more than 20 secs then try to set
                // the bookmark.  Otherwise, if the time taken is more than 
                // 2 secs make the pins we have so far
                var now = new Date();
                if ((now.getTime() - that.geocodeZero.getTime())/1000 > 20) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.startGeocode = new Date();
                } else if ((now.getTime() - that.startGeocode.getTime())/1000 > 2) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.RefitBounds();
                    that.startGeocode = new Date();
                }
       
                // If the geocodeResults array is totally filled, make the pins.
                if (doneGeocoding || that.geocodeList.Count == 0)
                {
                   //change cursor back ?
                   that.geocodeList = [];
                   if (that.inScopeLocList.Count == 0) {
                       this.ShowMapError();
                       return;
                   } else {
                       that.CreateMap(that.selectedItemId);
                       if (that.applyBookmark) {
                           that.SetBookmark();
                           that.applyBookmark = false;
                       }
                   }
               }
            }

        }
        return geocodeCallBack;
    },
    Geocode: function (locName, callbackFunction) {
        if (this.geocodeService == "Google"){
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode( {address: locName}, callbackFunction);
        } else {
            var that = this;
            var nominatimUrl = "http://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(locName) + "&format=xml";
            $.ajax({
                type: "GET",
                url: nominatimUrl,
	        crossDomain: true,
                success: callbackFunction,
                error: function(jqXHR, textStatus, errorThrown) {

		    var state = {
			    endpoint:	this.url,
			    httpCode:	jqXHR.status,
			    status:	jqXHR.statusText,
			    message:	errorThrown,
			    response:	jqXHR.responseText,
		    }

		    var p = document.createElement('a');
		    p.href = this.url;

		    state.endpoint = p.protocol + '//' + p.host + p.pathname;

		    if (state.status === 'timeout') {
		      state.message = "Timeout loading collection document";
		    } else if (state.status === 'error') {
		      if (this.crossDomain && (p.hostname !== window.location.hostname)) {
			state.message = "Possible issue with CORS settings on the endpoint"
		      }
		    } 

		    //Display a message so the user knows something is wrong
		    var msg = '';
		    msg = msg + 'Error loading GeoCoding Data:<br><br><table>';
		    msg = msg + '<colgroup><col style="white-space:nowrap;"><col></colgroup>';
		    msg = msg + '<tr><td>Endpoint</td><td>' + state.endpoint + '</td></tr>';
		    msg = msg + '<tr><td>Status</td><td>' + state.httpCode + '</td></tr>';
		    msg = msg + '<tr><td>Error</td><td> ' + state.message  + '</td></tr>';
		    msg = msg + '<tr><td style="vertical-align:top">Details</td><td>' + state.response + '</td></tr>';
		    msg = msg + '</table><br>Pivot Viewer cannot continue until this problem is resolved<br>';
		    $('.pv-wrapper').append("<div id=\"pv-loading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
		    var t=setTimeout(function(){window.open("#pv-loading-error","_self")},1000);
                }
            });
        }
    },
    GetLocationsFromNames: function () {
        var that = this;
        for (l = 0; l < this.itemsToGeocode.length; l ++) {
           var locName = this.itemsToGeocode[l].locName;
           this.Geocode(locName, this.MakeGeocodeCallBack(locName));
        }
        // Change cursor?
        this.startGeocode = new Date();
        this.startGeocode.setSeconds(this.startGeocode.getSeconds() + 2);
        this.geocodeZero = new Date();
    },
    CreateMap: function (selectedItemId) {
        var that = this;
        var centreLoc;
        var zoom = 8;
        var type = google.maps.MapTypeId.ROADMAP;
        var gotLoc = false;

        centreLat = parseFloat(this.mapCentreX);
        centreLng = parseFloat(this.mapCentreY);
        if ((!isNaN(centreLat) && !isNaN(centreLng)) && (centreLat != 0 && centreLng != 0)) {
            centreLoc = new google.maps.LatLng(centreLat, centreLng);
            gotLoc = true;
        }
        bookmarkZoom = parseInt(this.mapZoom);
        if (!isNaN(bookmarkZoom)) 
            zoom = bookmarkZoom;

        if (this.mapType && this.mapType != "")
            type = this.mapType;

        this.map = new google.maps.Map(document.getElementById('pv-map-canvas'));

        if (gotLoc)
            this.map.panTo(centreLoc);
        else if (this.selectedItemId) 
            this.CentreOnSelected (this.selectedItemId);

        //Add geometry to map using wicket library for reading WKT
        var geometryOK = true;
        var wkt = new Wkt.Wkt();
        try { // Catch any malformed WKT strings
            wkt.read(this.geometryValue);
        } catch (e1) {
            try {
                wkt.read(this.geometryValue.replace('\n', '').replace('\r', '').replace('\t', ''));
            } catch (e2) {
                if (e2.name === 'WKTError') {
                    PivotViewer.Debug.Log('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                    //return;
                    geometryOK = false;
                }
            }
        }
        if (geometryOK) {
            var obj = wkt.toObject(this.map.defaults);
            if (Wkt.isArray(obj)) {
                for (var o = 0; o < obj.length; o++) { 
                    obj[o].setMap(this.map);
                }
            } else 
                obj.setMap(this.map);
        }

        this.map.setMapTypeId(type);
        this.map.setZoom(zoom);

        // add map event listeners
        google.maps.event.addListener( this.map, 'maptypeid_changed', function() { 
            that.SetMapType(that.map.getMapTypeId());
            $.publish("/PivotViewer/Views/Item/Updated", null);
        } );
        google.maps.event.addListener( this.map, 'zoom_changed', function() { 
            that.SetMapZoom(that.map.getZoom());
            $.publish("/PivotViewer/Views/Item/Updated", null);
            that.GetOverlay();
        } );
        google.maps.event.addListener( this.map, 'center_changed', function() { 
            var centre = that.map.getCenter();
            if (centre) {
                that.SetMapCentreX(centre.lat());
                that.SetMapCentreY(centre.lng());
                $.publish("/PivotViewer/Views/Item/Updated", null);
                that.GetOverlay();
            }
        } );

        this.CreateMarkers();
        this.RefitBounds();
        this.GetOverlay();
        this.CreateLegend();
    },
    SetFacetCategories: function (collection) {
        this.categories = collection.FacetCategories;
    },
    GetFacetCategoryType: function (name) {
        for (i = 0; i < this.categories.length; i++) {
            if (this.categories[i].Name == name)
                return this.categories[i].Type;
        }
        // should never get here...
        return "not set";
    },
    SetGeocodeService: function (service) {
        this.geocodeService = service;
    },
    GetBucketNumber: function (id) {
        for (var i = 0; i < this.buckets.length; i++) {
            if ($.inArray(id, this.buckets[i].Ids) >= 0) 
                return i;
        }
        return 0;
    },
    GetIconForSortValue: function (id) {
        var icon;
        for (var i = 0; i < this.buckets.length; i++) {
            if ($.inArray(id, this.buckets[i].Ids) >= 0) 
                icon = this.iconFiles[i];
        }
        return icon;
    },
    CreateMarkers: function () {
        var that = this;

        // First clear all markers
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];

        for (i = 0; i < this.inScopeLocList.length; i++) {  
            marker = new google.maps.Marker({
                position: this.inScopeLocList[i].loc,
                map: this.map,
                title: this.inScopeLocList[i].title,
            });

            // Set icon image depending on value of the sort facet
            var bucket = this.GetBucketNumber(this.inScopeLocList[i].id);
            marker.setIcon(this.iconFiles[bucket]);

            if (this.inScopeLocList[i].id ==  this.selectedItemId) {
                marker.setIcon(this.iconFilesSelected[bucket]);
                marker.setZIndex(1000000000);
                $('.pv-toolbarpanel-maplegend').empty();
                $('.pv-toolbarpanel-maplegend').css( 'overflow', 'hidden');
                $('.pv-toolbarpanel-maplegend').css( 'text-overflow', 'ellipsis');
                var toolbarContent;
                toolbarContent = "<img style='height:15px;width:auto' src='" + that.iconFiles[bucket] + "'></img>";
                if (that.buckets[bucket].startRange == that.buckets[bucket].endRange)
                  toolbarContent += that.buckets[bucket].startRange; 
                else
                  toolbarContent += that.buckets[bucket].startRange + " to " + that.buckets[bucket].endRange; 
                $('.pv-toolbarpanel-maplegend').append(toolbarContent);
            }

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    if (that.selectedItemId == that.inScopeLocList[i].id) {
                        var bucket = that.GetBucketNumber(that.inScopeLocList[i].id);
                        marker.setIcon(that.iconFiles[bucket]);
                        selectedTile = null;
                        that.selectedItemId = "";
                        that.RefitBounds();
        		that.GetOverlay();
                        $('.pv-toolbarpanel-maplegend').empty();
                        $('.pv-mapview-legend').show('slide', {direction: 'up'});
                        $.publish("/PivotViewer/Views/Update/GridSelection", [{selectedItem: that.selectedItemId,  selectedTile: selectedTile}]);
                    } else {
                        that.selectedItemId = that.inScopeLocList[i].id;
                        var bucket = that.GetBucketNumber(that.inScopeLocList[i].id);
                        for (var j = 0; j < that.tiles.length; j++) { 
                            if (that.tiles[j].facetItem.Id == that.selectedItemId) {
                                selectedTile = that.tiles[j];
                                $('.pv-toolbarpanel-maplegend').empty();
                                var toolbarContent;
                                toolbarContent = "<img style='height:15px;width:auto' src='" + that.iconFiles[bucket] + "'></img>";
                                if (that.buckets[bucket].startRange == that.buckets[bucket].endRange)
                                  toolbarContent += that.buckets[bucket].startRange; 
                                else
                                  toolbarContent += that.buckets[bucket].startRange + " to " + that.buckets[bucket].endRange; 
                                $('.pv-toolbarpanel-maplegend').append(toolbarContent);
                                $.publish("/PivotViewer/Views/Update/GridSelection", [{selectedItem: that.selectedItemId,  selectedTile: selectedTile}]);
                                break;
                            }
                        }
                    }
                }
            })(marker, i));

            this.markers.push(marker);
        }
    },
    RefitBounds: function () {
        var bounds = new google.maps.LatLngBounds();

        for (i = 0; i < this.markers.length; i++) {  
            //extend the bounds to include each marker's position
            bounds.extend(this.markers[i].position);
        }

        //now fit the map to the newly inclusive bounds
        this.map.fitBounds(bounds);
        if (this.currentFilter.length == 1 && this.map.getZoom() > 15)
            this.map.setZoom(15);
    },
    GetOverlay: function () {
        // Get the boundary and use to get image to overlay
        var mapBounds = this.map.getBounds();
        if (mapBounds) {
          var southWest = mapBounds.getSouthWest();
          var northEast = mapBounds.getNorthEast();
          var width = $('#pv-map-canvas').width();
          var height = $('#pv-map-canvas').height();
          if (this.overlayBaseImageUrl != "") {
            if (this.overlay) 
                this.overlay.setMap(null);
            var overlayImageUrl = this.overlayBaseImageUrl+ "&bbox=" + southWest.lng() + "," + southWest.lat() + "," + northEast.lng() + "," + northEast.lat() + "&width=" + width + "&height=" + height ;
            this.overlay = new google.maps.GroundOverlay (overlayImageUrl, mapBounds, {opacity: 0.4});
            this.overlay.setMap(this.map);
          }
        }
    },
    DrawArea: function (selectedItemId) {
        var areaValue;
        var areaWkt = new Wkt.Wkt();

        //clear existing area object
        if (this.areaObj)
          this.areaObj.setMap(null);
        for (var i = 0; i < this.areaValues.length; i++) {
           if (this.areaValues[i].id == selectedItemId) {
              areaValue = this.areaValues[i].area;
              break;
           }
        }
        if (areaValue) {
            var geometryOK = true;
            try { // Catch any malformed WKT strings
                areaWkt.read(areaValue);
            } catch (e1) {
                try {
                    areaWkt.read(areaValue.replace('\n', '').replace('\r', '').replace('\t', ''));
                } catch (e2) {
                    if (e2.name === 'WKTError') {
                        PivotViewer.Debug.Log('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                        //return;
                        geometryOK = false;
                    }
                }
            }
            if (geometryOK) {
                this.areaObj = areaWkt.toObject({strokeColor:'#990000',fillColor:'#EEFFCC',fillOpacity:0.6});
                if (Wkt.isArray(this.areaObj)) {
                    for (var o = 0; o < this.areaObj.length; o++) { 
                        this.areaObj[o].setMap(this.map);
                    }
                } else 
                    this.areaObj.setMap(this.map);
            }
        }
    },
    RedrawMarkers: function (selectedItemId) {
        this.selectedItemId = selectedItemId;

        // First clear all markers
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];

        this.CreateMarkers();
        this.CentreOnSelected (selectedItemId);
        this.DrawArea(selectedItemId);
    },
    ShowMapError: function () {
        var msg = '';
        msg = msg + 'The current data selection does not contain any location information that can be shown on a map<br><br>';
        msg = msg + '<br>Choose a different view<br>';
        $('.pv-wrapper').append("<div id=\"pv-dzlocation-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
        var t=setTimeout(function(){window.open("#pv-dzlocation-error","_self")},1000)
        return;
    },
    GetMapCentreX: function () {
        return this.mapCentreX;
    },
    SetMapCentreX: function (centrex) {
        this.mapCentreX = centrex;
    },
    SetMapInitCentreX: function (centrex) {
        this.mapCentreX = centrex;
        this.mapInitCentreX = centrex;
    },
    GetMapCentreY: function () {
        return this.mapCentreY;
    },
    SetMapCentreY: function (centrey) {
        this.mapCentreY = centrey;
    },
    SetMapInitCentreY: function (centrey) {
        this.mapCentreY = centrey;
        this.mapInitCentreY = centrey;
    },
    GetMapType: function () {
        return this.mapType;
    },
    SetMapType: function (type) {
        this.mapType = type;
    },
    SetMapInitType: function (type) {
        this.mapType = type;
        this.mapInitType = type;
    },
    GetMapZoom: function () {
        return this.mapZoom;
    },
    SetMapZoom: function (zoom) {
        this.mapZoom = zoom;
    },
    SetMapInitZoom: function (zoom) {
        this.mapZoom = zoom;
        this.mapInitZoom = zoom;
    },
    CentreOnSelected: function (selectedItemId) {
        for (j = 0; j <  this.locList.length; j++) {
            if (this.locList[j].id == selectedItemId) {
                if (this.locList[j].loc.lat() != 0 && this.locList[j].loc.lng() != 0)
                    this.map.panTo(this.locList[j].loc);
            }
        }
    },
    SetBookmark: function() {
        var centreLoc;
        var zoom = 8;
        var type = google.maps.MapTypeId.ROADMAP;
        var gotLoc = false;

        centreLat = parseFloat(this.mapInitCentreX);
        centreLng = parseFloat(this.mapInitCentreY);
        if ((!isNaN(centreLat) && !isNaN(centreLng)) 
           && (centreLat != 0 && centreLng != 0)) {
            centreLoc = new google.maps.LatLng(centreLat, centreLng);
            gotLoc = true;
        }
        bookmarkZoom = parseInt(this.mapInitZoom);
        if (!isNaN(bookmarkZoom)) 
            zoom = bookmarkZoom;

        if (this.mapInitType && this.mapInitType != "")
            type = this.mapInitType;

        if (gotLoc)
            this.map.panTo(centreLoc);
        this.map.setMapTypeId(type);
        this.map.setZoom(zoom);
    },
    SetOverlayBaseUrl: function(baseUrl) {
        this.overlayBaseImageUrl = baseUrl;
    },
    CreateLegend: function() {
        // Get width of the info panel (width of icon image = 30 )
        var width = $('.pv-mapview-legend').width() - 32;
        $('.pv-mapview-legend').empty();
        $('.pv-mapview-legend').append("<div class='pv-legend-heading' style='height:28px' title='" + this.sortFacet + "'>" + this.sortFacet + "</div>");
        var tableContent = "<table id='pv-legend-data' style='color:#484848;'>";
        for (var i = 0; i < this.buckets.length; i++) {
            tableContent += "<tr><td><img src='" + this.iconFiles[i] + "'></img></td>";
            if (this.buckets[i].startRange == this.buckets[i].endRange)
              tableContent += "<td><div style='overflow:hidden;white-space:nowrap;width:" + width + "px;text-overflow:ellipsis'>" + this.buckets[i].startRange + "</div></td></tr>"; 
            else
              tableContent += "<td><div style='overflow:hidden;white-space:nowrap;width:" + width + "px;text-overflow:ellipsis'>" + this.buckets[i].startRange + " to " + this.buckets[i].endRange + "</div></td></tr>"; 
        }
        tableContent +="</table>";
        $('.pv-mapview-legend').append(tableContent);
    },
    //Groups into buckets based on first n chars
    Bucketize: function (dzTiles, filterList, orderBy, stringFacets) {
        var bkts = [];
        for (var i = 0; i < dzTiles.length; i++) {
            if ($.inArray(dzTiles[i].facetItem.Id, filterList) >= 0) {
                var hasValue = false;
                for (var j = 0; j < dzTiles[i].facetItem.Facets.length; j++) {
                    if (dzTiles[i].facetItem.Facets[j].Name == orderBy && dzTiles[i].facetItem.Facets[j].FacetValues.length > 0) {

                        for (var m = 0; m < dzTiles[i].facetItem.Facets[j].FacetValues.length; m++) { 
                            var val = dzTiles[i].facetItem.Facets[j].FacetValues[m].Value;

                            var found = false;
                            for (var k = 0; k < bkts.length; k++) {
//this needs fixing to handle the whole range...
                                if (bkts[k].startRange == val) {
                                    // If item is not already in the bucket add it
                                    if ($.inArray(dzTiles[i].facetItem.Id, bkts[k].Ids) < 0)
                                        bkts[k].Ids.push(dzTiles[i].facetItem.Id);
                                    found = true;
                                }
                            }
                            if (!found)
                                bkts.push({ startRange: val, endRange: val, Ids: [dzTiles[i].facetItem.Id], Values: [val] });

                            hasValue = true;
                        }
                    }
                }
                //If not hasValue then add it as a (no info) item
                if (!hasValue) {
                    var val = "(no info)";
                    var found = false;
                    for (var k = 0; k < bkts.length; k++) {
                        if (bkts[k].startRange == val) {
                            bkts[k].Ids.push(dzTiles[i].facetItem.Id);
                            bkts[k].Values.push(val);
                            found = true;
                        }
                    }
                    if (!found)
                        bkts.push({ startRange: val, endRange: val, Ids: [dzTiles[i].facetItem.Id], Values: [val] });
                }
            }
        }

	// If orderBy is one of the string filters then only include buckets that are in the filter
	if ( stringFacets.length > 0 ) {
	    var sortIndex;
	    for ( var f = 0; f < stringFacets.length; f++ ) {
	        if ( stringFacets[f].facet == orderBy ) {
		    sortIndex = f;
		    break;
	        }
            }
	    if ( sortIndex != undefined  && sortIndex >= 0 ) {
	        var newBktsArray = [];
	        var filterValues = stringFacets[sortIndex].facetValue;
	        for ( var b = 0; b < bkts.length; b ++ ) {
		    var valueIndex = $.inArray(bkts[b].startRange, filterValues ); 
		    if (valueIndex >= 0 )
		        newBktsArray.push(bkts[b]);
	        }
	        bkts = newBktsArray;
	    }
	}

        var current = 0;
        while (bkts.length > 8) {
            if (current < bkts.length - 1) {
                bkts[current].endRange = bkts[current + 1].endRange;
                for (var i = 0; i < bkts[current + 1].Ids.length; i++) {
                    if ($.inArray(bkts[current+1].Ids[i], bkts[current].Ids) < 0) 
                        bkts[current].Ids.push(bkts[current + 1].Ids[i]);
                        if ($.inArray(bkts[current + 1].endRange, bkts[current].Values) < 0) 
                            bkts[current].Values.push(bkts[current + 1].endRange);
                }
                bkts.splice(current + 1, 1);
                current++;
            } else
                current = 0;
        }

        return bkts;
    },
	//http://stackoverflow.com/questions/979256/how-to-sort-an-array-of-javascript-objects
    SortBy: function (field, reverse, primer, filterValues) {

	var key = function (x, filterValues) {
		if (primer) {
			for (var i = x.facetItem.Facets.length - 1; i > -1; i -= 1) {
				if (x.facetItem.Facets[i].Name == field && x.facetItem.Facets[i].FacetValues.length > 0) {
                                    // If a numeric value could check if value is within filter 
                                    // bounds but will have been done already
                                    if ($.isNumeric(x.facetItem.Facets[i].FacetValues[0].Value) )
				            return primer(x.facetItem.Facets[i].FacetValues[0].Value);
                                    // If a string facet then could have a number of values.  Only
                                    // sort on values in the filter 
                                    else {                      
                                        for (var j = 0; j < x.facetItem.Facets[i].FacetValues.length; j++) {
                                            // Has a filter been set? If so, and it is the same facet as the sort
                                            // then sort on the items in the filter where possible (otherwise just 
                                            // use the first value.?
                                            if (filterValues.length > 0) {
                                                for (var k = 0; k < filterValues.length; k++) {
                                                    if (filterValues[k].facet == field) {
                                                         for (var l = 0; l < filterValues[k].facetValue.length; l++) {
                                                             if ( x.facetItem.Facets[i].FacetValues[j].Value == filterValues[k].facetValue[l]) {  
				                                 return primer(x.facetItem.Facets[i].FacetValues[j].Value);
                                                             }
                                                         }
                                                     } 
                                                }
                                            } 
                                        }
                                        return primer(x.facetItem.Facets[i].FacetValues[0].Value);
                                    }
                                }
			}
		}
		return null;
	};

	return function (a, b) {
		var A = key(a, filterValues), B = key(b, filterValues);
		return (A < B ? -1 : (A > B ? 1 : 0)) * [1, -1][+!!reverse];
	}
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///Map View
PivotViewer.Views.MapView2 = PivotViewer.Views.IPivotViewerView.subClass({
    init: function () {
        this._super();
        this.locCache = Array();
        this.locList = Array();
        this.inScopeLocList = Array();
        this.map; 
        this.markers = Array();
        this.overlay;
        this.overlayBaseImageUrl = "";
        this.selectedItemId;
        this.geocodeList = Array();
        this.itemsToGeocode = Array();
        this.startGeocode;
        this.geocodeZero;
        this.mapInitZoom = "";
        this.mapInitType = "";
        this.mapInitCentreX = "";
        this.mapInitCentreY = "";
        this.mapZoom = "";
        this.mapType = "";
        this.mapCentreX = "";
        this.mapCentreY = "";
        this.applyBookmark = false;
        this.geocodeService = "";
        this.geometryValue = "";
        this.areaValues = Array();
        this.areaObj;
        var that = this;
        this.buckets = [];
        this.icons = [];
        this.iconsSelected = [];
    },
    Setup: function (width, height, offsetX, offsetY, tileMaxRatio) { 
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        this.currentOffsetX = this.offsetX;
        this.currentOffsetY = this.offsetY;
        // Check for local storage support
        if (Modernizr.localstorage)
            this.localStorage = true;
        else
            this.localStorage = false;
        this.map = new L.Map(document.getElementById('pv-map-canvas'));

	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data ?? OpenStreetMap contributors';
	this.osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		

        // create the icon set
        var RedIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/Red.png' }});
        this.icons.push(RedIcon);
        var RedDotIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/RedDot.png' }});
        this.iconsSelected.push(RedDotIcon);
        var YellowIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/Yellow.png' }});
        this.icons.push(YellowIcon);
        var YellowDotIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/YellowDot.png' }});
        this.iconsSelected.push(YellowDotIcon);
        var GreenIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/DarkGreen.png' }});
        this.icons.push(GreenIcon);
        var GreenDotIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/DarkGreenDot.png' }});
        this.iconsSelected.push(GreenDotIcon);
        var BlueIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/Blue.png' }});
        this.icons.push(BlueIcon);
        var BlueDotIcon = L.Icon.Default.extend({options: {iconUrl: 'scripts/images/BlueDot.png' }});
        this.iconsSelected.push(BlueDotIcon);
        var PurpleIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/Purple.png' }});
        this.icons.push(PurpleIcon);
        var PurpleDotIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/PurpleDot.png' }});
        this.iconsSelected.push(PurpleDotIcon);
        var OrangeIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/Orange.png' }});
        this.icons.push(OrangeIcon);
        var OrangeDotIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/OrangeDot.png' }});
        this.iconsSelected.push(OrangeDotIcon);
        var PinkIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/Pink.png' }});
        this.icons.push(PinkIcon);
        var PinkDotIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/PinkDot.png' }});
        this.iconsSelected.push(PinkDotIcon);
        var SkyIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/Sky.png' }});
        this.icons.push(SkyIcon);
        var SkyDotIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/SkyDot.png' }});
        this.iconsSelected.push(SkyDotIcon);
        var LimeIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/Lime.png' }});
        this.icons.push(LimeIcon);
        var LimeDotIcon = L.Icon.Default.extend({options: { iconUrl: 'scripts/images/LimeDot.png' }});
        this.iconsSelected.push(LimeDotIcon);
    },
    Filter: function (dzTiles, currentFilter, sortFacet, stringFacets, changingView, selectedItem) { 
        var that = this;
        var g = 0;  //keeps track of the no. of geocode locations;
        if (!Modernizr.canvas)
            return;

        PivotViewer.Debug.Log('Map View Filtered: ' + currentFilter.length);

        if (changingView) {
            $('.pv-viewarea-canvas').fadeOut();
            $('.pv-tableview-table').fadeOut();
            $('.pv-mapview-canvas').fadeOut();
            $('.pv-timeview-canvas').fadeOut();
            $('.pv-toolbarpanel-sort').fadeIn();
            $('.pv-toolbarpanel-timelineselector').fadeOut();
            $('.pv-toolbarpanel-zoomslider').fadeOut();
            $('.pv-toolbarpanel-maplegend').fadeIn();
            if (!selectedItem)
                $('.pv-mapview-legend').show('slide', {direction: 'up'});
            $('.pv-toolbarpanel-zoomcontrols').css('border-width', '0');
            $('#MAIN_BODY').css('overflow', 'auto');
            $('.pv-mapview-canvas').fadeIn(function(){
                if (selectedItem)
                    $.publish("/PivotViewer/Views/Item/Selected", [{id: selectedItem.Id, bkt: 0}]);
            });
        }

        //Check for location information

        this.sortFacet = sortFacet;
        //this.tiles = dzTiles;
        this.currentFilter = currentFilter;
        this.selectedItemId = "";

        //Sort and bucketize so items can be grouped using coloured pins
        this.tiles = dzTiles.sort(this.SortBy(this.sortFacet, false, function (a) {
            return $.isNumeric(a) ? a : a.toUpperCase();
        }, stringFacets));

        this.buckets = this.Bucketize(dzTiles, currentFilter, this.sortFacet, stringFacets);

        //Empty the inScope item list
        this.inScopeLocList = [];        

        //Clear legend info in toolbar
        $('.pv-toolbarpanel-maplegend').empty();
        if (!changingView && !selectedItem) 
            $('.pv-mapview-legend').show('slide', {direction: 'up'});

        //Check for geometry facet
        //This should contain a geometry definition im WKT that applies to the whole collection
        //E.g. where a geometry filter has been applied
        var gotGeometry = false;
        for (var i = 0; i < currentFilter.length && !gotGeometry; i++) {
            for (var j = 0; j < this.tiles.length && !gotGeometry; j++) { 
                if (this.tiles[j].facetItem.Id == currentFilter[i]) {
                    for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++) {
                        if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("GEOMETRY") >= 0) {
                            //If multiple values just use the first one for now...
                            this.geometryValue = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                            gotGeometry = true;
                            break;
                        }
                    }
                }
            }
        }

        //Check for area facet
        //This should contain a geometry definition im WKT that applies to an individual item
        for (var i = 0; i < currentFilter.length; i++) {
            for (var j = 0; j < this.tiles.length; j++) { 
                if (this.tiles[j].facetItem.Id == currentFilter[i]) {
                    for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++) {
                        if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("AREA") >= 0) {
                            var areaValue = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                            this.areaValues.push({id: this.tiles[j].facetItem.Id, area: areaValue});
                            break;
                        }
                    }
                }
            }
        }

        //Create a list of in scope locations
        for (var i = 0; i < currentFilter.length; i++) {
            for (var j = 0; j < this.tiles.length; j++) { 
                if (this.tiles[j].facetItem.Id == currentFilter[i]) {
                    //Tile is in scope
                    var latitude;
                    var longitude;
                    var gotLatitude = false;
                    var gotLongitude = false;
                    var gotLocation = false;
                    var inCache = false;
                    var itemId = this.tiles[j].facetItem.Id;
                    var itemName = this.tiles[j].facetItem.Name;

                    //Have we cached the item location?
                    for (var c = 0; c < this.locList.length; c ++) {
                        if (this.locList[c].id == itemId) {
                            if (this.locList[c].loc.lat != 0 || this.locList[c].loc.lng != 0) 
                                this.inScopeLocList.push(this.locList[c]);
                            inCache = true;
                            break;
                        }
                    }
             
                    if (!inCache) {
                        //First try to get co-ordinate information from the facets
                        for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++) {
                            if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("LATITUDE") >= 0) {
                                //If multiple values just use the first one for now...
                                var facetType = this.GetFacetCategoryType (this.tiles[j].facetItem.Facets[k].Name);
                                if (facetType == "String")
                                  latitude = parseFloat(this.tiles[j].facetItem.Facets[k].FacetValues[0].Value);
                                else if (facetType == "Number") 
                                  latitude = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                                else
                                  break;
                                gotLatitude = true;
                                if (gotLongitude) {
                                    var newLoc = new L.LatLng(latitude, longitude);
                                    this.locList.push({id: itemId, loc: newLoc, title: itemName});
                                    this.inScopeLocList.push({id: itemId, loc: newLoc, title: itemName});
                                    gotLocation = true;
                                    break;
                                }
                            }
                            else if (this.tiles[j].facetItem.Facets[k].Name.toUpperCase().indexOf("LONGITUDE") >= 0) {
                                var facetType = this.GetFacetCategoryType (this.tiles[j].facetItem.Facets[k].Name);
                                if (facetType == "String")
                                  longitude = parseFloat(this.tiles[j].facetItem.Facets[k].FacetValues[0].Value);
                                else if (facetType == "Number") 
                                  longitude = this.tiles[j].facetItem.Facets[k].FacetValues[0].Value;
                                else
                                  break;
                                gotLongitude = true;
                                if (gotLatitude) {
                                    var newLoc = new L.LatLng(latitude, longitude);
                                    this.locList.push({id: itemId, loc: newLoc, title: itemName});
                                    this.inScopeLocList.push({id: itemId, loc: newLoc, title: itemName});
                                    gotLocation = true;
                                    break;
                                }
                            }
                        }//loop through facets counter k
                        if (!gotLocation) {
                            //Look for specially named facet LOCATION
                            for (var f = 0; f < this.tiles[j].facetItem.Facets.length; f++) {
                               if (this.tiles[j].facetItem.Facets[f].Name.toUpperCase().indexOf("LOCATION") >= 0) {
                                   //go through the values 
                                   for (var v = 0; v < this.tiles[j].facetItem.Facets[f].FacetValues.length; v++) {
                                       var value = this.tiles[j].facetItem.Facets[f].FacetValues[v].Value;
                                       var invalidCoordinates = false;
                                  
                                       if (value.toUpperCase().indexOf("POINT(") == 0 ) {
                                           longitude = value.substring(7, value.indexOf(' ', 7));
                                           latitude  = value.substring(value.indexOf(' ', 7) + 1, value.indexOf(')', 7));
                                           if (latitude != "NaN" && longitude != "NaN") {
                                               var lat = parseFloat(latitude);
                                               var lon = parseFloat(longitude);
                                               if (!isNaN(lat) && ! isNaN(lon)) {
                                                   var newLoc = new L.LatLng(lat, lon);
                                                   this.locList.push({id: itemId, loc: newLoc, title: itemName});
                                                   this.inScopeLocList.push({id: itemId, loc: newLoc, title: itemName});
                                                   gotLocation = true;
                                                   break;
                                               }
                                           } else
                                               invalidCoordinates = true;
                                       //at this point silverlight version checks for other stuff
                                       }  else if (value.indexOf(",") > -1 ) {
                                           //Could be a co-ordinate pair
                                           var lat = parseFloat(value.substring(0, value.indexOf(',')));
                                           var lon = parseFloat(value.substring(value.indexOf(',')));
                                           if (!isNaN(lat) && !isNaN(lon)) {
                                               //ok, have co-ordinate pair
                                               var newLoc = new L.LatLng(lat, lon);
                                               this.locList.push({id: itemId, loc: newLoc, title: itemName});
                                               this.inScopeLocList.push({id: itemId, loc: newLoc, title: itemName});
                                               gotLocation = true;
                                               break;
                                           } else
                                               invalidCoordinates = true;
                                      }
                                      if (!invalidCoordinates) {
                                          //If we get here then we still have not got a location
                                          //So try geocoding a location name
                                  
                                          // Quick check - is the place more than 1 char long
                                          if (value.length > 1) {
                                              // Note: replace all _ with a space
                                              var geoLoc = value.replace('_', ' ').toUpperCase();
                                  
                                              // First add region and country to the location.
                                              for (var r = 0; r < this.tiles[j].facetItem.Facets.length; r++) {
                                                  if (this.tiles[j].facetItem.Facets[r].Name.toUpperCase().indexOf("REGION") >= 0) {
                                                      var region = this.tiles[j].facetItem.Facets[r].FacetValues[0].Value;
                                                      if (region.length > 1)
                                                          geoLoc = geoLoc + ", " + region.replace('_', ' ').toUpperCase();
                                                      break;
                                                  }
                                              }
                                  
                                              for (var s = 0; s < this.tiles[j].facetItem.Facets.length; s++) {
                                                  if (this.tiles[j].facetItem.Facets[s].Name.toUpperCase().indexOf("COUNTRY") >= 0) {
                                  
                                                      var country = this.tiles[j].facetItem.Facets[s].FacetValues[0].Value;
                                                      if (country.length > 1)
                                                          geoLoc = geoLoc + ", " + country.replace('_', ' ').toUpperCase();
                                                      break;
                                                  }
                                              }
                                  
                                              // Is it in the cache?
                                              for (var l = 0; l < this.locCache.length; l++) {
                                                  if (this.locCache[l].locName == geoLoc) {
                                  
                                                      this.locList.push({id: itemId, loc: this.locCache[l].loc, title: itemName});
                                                      this.inScopeLocList.push({id: itemId, loc: this.locCache[l].loc, title: itemName});
                                                      gotLocation = true;
                                                      break;
                                                  }
                                              }

                                              if (!gotLocation) {
                                                  // Now try the users persistent cache
                                                  if (this.localStorage) {
                                                      var newLatLng;
                                                      var newLoc = JSON.parse(localStorage.getItem(geoLoc));
                                                      if (newLoc) {
                                                          var lat = parseFloat(newLoc.lat);
                                                          var lng = parseFloat(newLoc.lng);
                                                          if (!isNaN(lat) && !isNaN(lng)) {
                                                              newLatLng = new L.LatLng(lat, lng);
                                                              // Add it to local cache
                                                              this.locCache.push({locName: geoLoc, loc: newLatLng});
                                                              this.locList.push({id: itemId, loc: newLatLng, title: itemName});
                                                              this.inScopeLocList.push({id: itemId, loc: newLatLng, title: itemName});
                                                              gotLocation = true;
                                                          }
                                                      }
                                                  }
                                                  if (!gotLocation) {
                                                      // Not in local or persistent cache so will have to use geocode service
                                                      // Add location to list for geocoding (will need to keep itemId name with it)
                                                      if (g < 1000) {//limiting the number of items to geocode at once to 1000 for now
                                                          var foundIt = false;
                                                          for (var gl = 0; gl < this.geocodeList.length; gl++) {
                                                              if (this.geocodeList[gl] == geoLoc) {
                                                                  foundIt = true;
                                                                  break;
                                                              }
                                                          }
                                                          if (!foundIt) {
                                                            this.geocodeList.push(geoLoc);
                                                            g++;
                                                          }
                                                          this.itemsToGeocode.push({id: itemId, locName: geoLoc, title:itemName});
                                                          gotLocation = true;
                                                          break;
                                                      }
                                                  } // Not in persistent geocode cache
                                              } // Not in in-memory geocode cache
                                          } //Location name longr than 1
                                       } //Not invalid co-ordinates 
                                   } //Go through location values v
                                   //Found a value in a location facet
                                   if (gotLocation)
                                       break;
                               }// Facet is LOCATION
                            } //loop through facets f
                        } //Not got co-ordinate - will need to geocode
                    } //Item i already has location 
                } //Tile j matches filter item i
            } //Tiles j
        } //Items in the filter i

        //Check that at least one in scope item has a location
        if (this.inScopeLocList.length == 0 && g == 0) {
            this.ShowMapError();
            return;
        } else if (g > 0 ){
            //Now do the geocoding
            this.GetLocationsFromNames();
        } //else {
            $('.pv-mapview-canvas').css('height', this.height - 12 + 'px');
            $('.pv-mapview-canvas').css('width', this.width - 415 + 'px');
            if (selectedItem)
                this.CreateMap(selectedItem.Id);
            else
                this.CreateMap("");
        //}
    },
    GetUI: function () { return ''; },
    GetButtonImage: function () {
        return 'images/MapView.png';
    },
    GetButtonImageSelected: function () {
        return 'images/MapViewSelected.png';
    },
    GetViewName: function () { return 'Map View 2'; },
    MakeGeocodeCallBack: function(locName) {
        var that = this;
        if (this.geocodeService == "Google"){
            var geocodeCallBack = function(results, status) {
                var dummy = new L.LatLng(0, 0);
                var loc = dummy;
                
                if (status == google.maps.GeocoderStatus.OK) { 
                    var googleLoc = results[0].geometry.location;
                    var lat = googleLoc.lat();
                    var lon = googleLoc.lng();
                    if (lat && lon)
                      loc = new L.LatLng(lat, lon);
                }

                // Add to local cache
                that.locCache.push ({locName: locName, loc: loc});
       
                // Add to persistent cache
                if (this.localStorage) {
                    var newLoc = {
                        lat: loc.lat,
                        lng: loc.lng
                    };
                    localStorage.setItem(locName, JSON.stringify(newLoc));
                }
       
                // Find items that have that location
                for (var i = 0; i < that.itemsToGeocode.length; i++ ) {
                    var itemId = that.itemsToGeocode[i].id;
                    var value = that.itemsToGeocode[i].locName;
                    var title = that.itemsToGeocode[i].title;
                    if (value == locName) {
                        that.locList.push({id: itemId, loc:loc, title: title});
                        if (loc.lat != 0 || loc.lng != 0)
                             that.inScopeLocList.push({id:itemId, loc:loc, title: title});
                    }
                }
       
                var doneGeocoding = true;
                for (var g = 0; g < that.geocodeList.length; g++) {
                    var value = that.geocodeList[g];
                    var currentLocNotFound = true;
                    for (var c = 0; c < that.locCache.length; c++) {
                        if (that.locCache[c].locName == value) {
                            currentLocNotFound = false;
                            break;
                        }
                    }
                    if (currentLocNotFound) {
                       doneGeocoding = false;
                       break;
                   }
                }
                // If geocoding has taken more than 20 secs then try to set
                // the bookmark.  Otherwise, if the time taken is more than 
                // 2 secs make the pins we have so far
                var now = new Date();
                if ((now.getTime() - that.geocodeZero.getTime())/1000 > 20) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.startGeocode = new Date();
                } else if ((now.getTime() - that.startGeocode.getTime())/1000 > 2) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.RefitBounds();
        	    that.GetOverlay();
                    that.startGeocode = new Date();
                }
       
                // If the geocodeResults array is totally filled, make the pins.
                if (doneGeocoding || that.geocodeList.Count == 0)
                {
                   //change cursor back ?
                   that.geocodeList = [];
                   if (that.inScopeLocList.Count == 0) {
                       this.ShowMapError();
                       return;
                   } else {
                       that.CreateMap(that.selectedItemId);
                       if (that.applyBookmark) {
                           that.SetBookmark();
                           that.applyBookmark = false;
                       }
                   }
               }
            }
        } else {
            var geocodeCallBack = function(xml) {
                var dummy = new L.LatLng(0, 0);
                var loc = dummy;
                var results = $(xml).find("searchresults");
                var place = $(xml).find("place");
 
                if (place) {
                    var lat = $(place).attr("lat");
                    var lon = $(place).attr("lon");
                    if (lat && lon)
                      loc = new L.LatLng(lat, lon);
                }

                // Add to local cache
                that.locCache.push ({locName: locName, loc: loc});
       
                // Add to persistent cache
                if (this.localStorage) {
                    var newLoc = {
                        lat: loc.lat,
                        lng: loc.lng
                    };
                    localStorage.setItem(locName, JSON.stringify(newLoc));
                }
       
                // Find items that have that location
                for (var i = 0; i < that.itemsToGeocode.length; i++ ) {
                    var itemId = that.itemsToGeocode[i].id;
                    var value = that.itemsToGeocode[i].locName;
                    var title = that.itemsToGeocode[i].title;
                    if (value == locName) {
                        that.locList.push({id: itemId, loc:loc, title: title});
                        if (loc.lat != 0 || loc.lng != 0)
                             that.inScopeLocList.push({id:itemId, loc:loc, title: title});
                    }
                }
       
                var doneGeocoding = true;
                for (var g = 0; g < that.geocodeList.length; g++) {
                    var value = that.geocodeList[g];
                    var currentLocNotFound = true;
                    for (var c = 0; c < that.locCache.length; c++) {
                        if (that.locCache[c].locName == value) {
                            currentLocNotFound = false;
                            break;
                        }
                    }
                    if (currentLocNotFound) {
                       doneGeocoding = false;
                       break;
                   }
                }
                // If geocoding has taken more than 20 secs then try to set
                // the bookmark.  Otherwise, if the time taken is more than 
                // 2 secs make the pins we have so far
                var now = new Date();
                if ((now.getTime() - that.geocodeZero.getTime())/1000 > 20) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.startGeocode = new Date();
                } else if ((now.getTime() - that.startGeocode.getTime())/1000 > 2) {
                    that.RedrawMarkers(that.selectedItemId);
                    that.RefitBounds();
                    that.startGeocode = new Date();
                }
       
                // If the geocodeResults array is totally filled, make the pins.
                if (doneGeocoding || that.geocodeList.Count == 0)
                {
                   //change cursor back ?
                   that.geocodeList = [];
                   if (that.inScopeLocList.Count == 0) {
                       this.ShowMapError();
                       return;
                   } else {
                       that.CreateMap(that.selectedItemId);
                       if (that.applyBookmark) {
                           that.SetBookmark();
                           that.applyBookmark = false;
                       }
                   }
               }
            }

        }
        return geocodeCallBack;
    },
    Geocode: function (locName, callbackFunction) {
        if (this.geocodeService == "Google"){
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode( {address: locName}, this.MakeGeocodeCallBack(locName));
        } else {
            var that = this;
            var nominatimUrl = "http://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(locName) + "&format=xml";
            $.ajax({
                type: "GET",
                url: nominatimUrl,
	        crossDomain: true,
                success: callbackFunction,
                error: function(jqXHR, textStatus, errorThrown) {
		    var state = {
			    endpoint:	this.url,
			    httpCode:	jqXHR.status,
			    status:	jqXHR.statusText,
			    message:	errorThrown,
			    response:	jqXHR.responseText,
		    }

		    var p = document.createElement('a');
		    p.href = this.url;

		    state.endpoint = p.protocol + '//' + p.host + p.pathname;

		    if (state.status === 'timeout') {
		      state.message = "Timeout loading collection document";
		    } else if (state.status === 'error') {
		      if (this.crossDomain && (p.hostname !== window.location.hostname)) {
			state.message = "Possible issue with CORS settings on the endpoint"
		      }
		    } 

		    //Display a message so the user knows something is wrong
		    var msg = '';
		    msg = msg + 'Error loading GeoCoding Data:<br><br><table>';
		    msg = msg + '<colgroup><col style="white-space:nowrap;"><col></colgroup>';
		    msg = msg + '<tr><td>Endpoint</td><td>' + state.endpoint + '</td></tr>';
		    msg = msg + '<tr><td>Status</td><td>' + state.httpCode + '</td></tr>';
		    msg = msg + '<tr><td>Error</td><td> ' + state.message  + '</td></tr>';
		    msg = msg + '<tr><td style="vertical-align:top">Details</td><td>' + state.response + '</td></tr>';
		    msg = msg + '</table><br>Pivot Viewer cannot continue until this problem is resolved<br>';
		    $('.pv-wrapper').append("<div id=\"pv-loading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
		    var t=setTimeout(function(){window.open("#pv-loading-error","_self")},1000);
                }
            });
        }
    },
    GetLocationsFromNames: function () {
        var that = this;
        for (l = 0; l < this.itemsToGeocode.length; l ++) {
           var locName = this.itemsToGeocode[l].locName;
           this.Geocode(locName, this.MakeGeocodeCallBack(locName));
        }
        // Change cursor?
        this.startGeocode = new Date();
        this.startGeocode.setSeconds(this.startGeocode.getSeconds() + 2);
        this.geocodeZero = new Date();
    },
    CreateMap: function (selectedItemId) {
        var that = this;
        var centreLoc;
        var zoom = 8;
        var gotLoc = false;
        var gotBookmarkZoom = false;

        centreLat = parseFloat(this.mapCentreX);
        centreLng = parseFloat(this.mapCentreY);
        if (!isNaN(centreLat) && !isNaN(centreLng)) {
            centreLoc = new L.LatLng(centreLat, centreLng);
            gotLoc = true;
        }
        bookmarkZoom = parseInt(this.mapZoom);
        if (!isNaN(bookmarkZoom)) 
        {
            zoom = bookmarkZoom;
            gotBookmarkZoom = true;
        }

        // Currently map type not supported in this view
        //if (this.mapType && this.mapType != "")
        //    type = this.mapType;

        //this.map = new google.maps.Map(document.getElementById('pv-map-canvas'), mapOptions);
        //this.map = new L.Map(document.getElementById('pv-map-canvas'), { center: [0,0], zoom: 5 });
/*
        this.map = new L.Map(document.getElementById('pv-map-canvas'));

	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data ?? OpenStreetMap contributors';
	var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		
*/

        if (gotLoc)
	    this.map.setView(centreLoc,zoom);
            //this.map.panTo(centreLoc);
        else
	    this.map.setView(new L.LatLng(0,0),zoom);

        if (this.selectedItemId) 
            this.CentreOnSelected (this.selectedItemId);

        //Add geometry to map using wicket library for reading WKT
        var geometryOK = true;
        var wkt = new Wkt.Wkt();
        try { // Catch any malformed WKT strings
            wkt.read(this.geometryValue);
        } catch (e1) {
            try {
                wkt.read(this.geometryValue.replace('\n', '').replace('\r', '').replace('\t', ''));
            } catch (e2) {
                if (e2.name === 'WKTError') {
                    PivotViewer.Debug.Log('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                    //return;
                    geometryOK = false;
                }
            }
        }
        if (geometryOK) {
            var obj = wkt.toObject(this.map.defaults);
            if (Wkt.isArray(obj)) {
                for (var o = 0; o < obj.length; o++) { 
                    this.map.addLayer(obj[o]);
                }
            } else 
                this.map.addLayer(obj);
        }

	this.map.addLayer(this.osm);

        // add map event listeners
        this.map.on('zoomend', function(e) {
            that.SetMapZoom(that.map.getZoom());
            $.publish("/PivotViewer/Views/Item/Updated", null);
            that.GetOverlay();
        } );
        this.map.on('moveend', function(e) {
            var centre = that.map.getCenter();
            that.SetMapCentreX(centre.lat);
            that.SetMapCentreY(centre.lng);
            $.publish("/PivotViewer/Views/Item/Updated", null);
            that.GetOverlay();
        } );

        this.CreateMarkers();
        if (!gotBookmarkZoom)
          this.RefitBounds();
        else
	  this.map.setView(centreLoc,zoom);
        this.GetOverlay();
        this.CreateLegend();
    },
    SetFacetCategories: function (collection) {
        this.categories = collection.FacetCategories;
    },
    GetFacetCategoryType: function (name) {
        for (i = 0; i < this.categories.length; i++) {
            if (this.categories[i].Name == name)
                return this.categories[i].Type;
        }
        // should never get here...
        return "not set";
    },
    SetGeocodeService: function (service) {
        this.geocodeService = service;
    },
    GetBucketNumber: function (id) {
        for (var i = 0; i < this.buckets.length; i++) {
            if ($.inArray(id, this.buckets[i].Ids) >= 0) 
                return i;
        }
        return 0;
    },
/*
    GetIconForSortValue: function (id) {
        var icon;
        for (var i = 0; i < this.buckets.length; i++) {
            if ($.inArray(id, this.buckets[i].Ids) >= 0) 
                icon = this.icons[i];
        }
        return icon;
    },
*/
    CreateMarkers: function () {
        var that = this;

        // First clear all markers
        for (var i = 0; i < this.markers.length; i++) {
            this.map.removeLayer(this.markers[i]);
            //this.markers[i].setMap(null);
        }
        this.markers = [];
/*
        var GreenIcon = L.Icon.Default.extend({
            options: {
            	    iconUrl: 'scripts/images/green-icon.png' 
            }
         });
        //var blueIcon = new L.Icon();
        var greenIcon = new GreenIcon();
*/

                //icon: blueIcon,
        for (i = 0; i < this.inScopeLocList.length; i++) {  
            var marker = new L.Marker(this.inScopeLocList[i].loc, {
                title: this.inScopeLocList[i].title,
            })
            this.map.addLayer(marker);

            // Set icon depending on value of the sort facet
            var bucket = this.GetBucketNumber(this.inScopeLocList[i].id);
            marker.setIcon(new this.icons[bucket]);

            if (this.inScopeLocList[i].id ==  this.selectedItemId) {
                marker.setIcon(new this.iconsSelected[bucket]);
                marker.setZIndexOffset(1000000000);
                $('.pv-toolbarpanel-maplegend').empty();
                $('.pv-toolbarpanel-maplegend').css( 'overflow', 'hidden');
                $('.pv-toolbarpanel-maplegend').css( 'text-overflow', 'ellipsis');
                var toolbarContent;
                toolbarContent = "<img style='height:15px;width:auto' src='" + marker._icon.src + "'></img>";
                if (that.buckets[bucket].startRange == that.buckets[bucket].endRange)
                  toolbarContent += that.buckets[bucket].startRange; 
                else
                  toolbarContent += that.buckets[bucket].startRange + " to " + that.buckets[bucket].endRange; 
                $('.pv-toolbarpanel-maplegend').append(toolbarContent);
            }

            //google.maps.event.addListener(marker, 'click', (function(marker, i) {
                        //marker.setIcon(blueIcon);
            marker.on('click', (function(marker, i) {
                return function() {
                    if (that.selectedItemId == that.inScopeLocList[i].id) {
                        var bucket = that.GetBucketNumber(that.inScopeLocList[i].id);
                        marker.setIcon(new that.icons[bucket]);
                        selectedTile = null;
                        that.selectedItemId = "";
                        that.RefitBounds();
        		that.GetOverlay();
                        $('.pv-toolbarpanel-maplegend').empty();
                        $('.pv-mapview-legend').show('slide', {direction: 'up'});
                        $.publish("/PivotViewer/Views/Update/GridSelection", [{selectedItem: that.selectedItemId,  selectedTile: selectedTile}]);
                    } else {
                        that.selectedItemId = that.inScopeLocList[i].id;
                        var bucket = that.GetBucketNumber(that.inScopeLocList[i].id);
                        for (var j = 0; j < that.tiles.length; j++) { 
                            if (that.tiles[j].facetItem.Id == that.selectedItemId) {
                                selectedTile = that.tiles[j];
                                $('.pv-toolbarpanel-maplegend').empty();
                                var toolbarContent;
                                toolbarContent = "<img style='height:15px;width:auto' src='" + marker._icon.src + "'></img>";
                                if (that.buckets[bucket].startRange == that.buckets[bucket].endRange)
                                  toolbarContent += that.buckets[bucket].startRange; 
                                else
                                  toolbarContent += that.buckets[bucket].startRange + " to " + that.buckets[bucket].endRange; 
                                $('.pv-toolbarpanel-maplegend').append(toolbarContent);
                                $.publish("/PivotViewer/Views/Update/GridSelection", [{selectedItem: that.selectedItemId,  selectedTile: selectedTile}]);
                                break;
                            }
                        }
                    }
                }
            })(marker, i));

            this.markers.push(marker);
        }
    },
    RefitBounds: function () {
        //var bounds = new L.LatLngBounds();
        var bounds;
        var markerPos = [];

        if (this.markers.length > 0) {
            for (i = 0; i < this.markers.length; i++) {  
                //extend the bounds to include each marker's position
                //bounds.extend(this.markers[i].position);
                markerPos.push (this.markers[i].getLatLng());
            }
            bounds = new L.LatLngBounds(markerPos);
        
            //Seems to fix issue where map not actually loaded at this point
            this.map.invalidateSize();
            //now fit the map to the newly inclusive bounds
            this.map.fitBounds(bounds);
        }
    },
    GetOverlay: function () {
        // Get the boundary and use to get image to overlay
        var mapBounds = this.map.getBounds();
        var west = mapBounds.getWest();
        var east = mapBounds.getEast();
        var north = mapBounds.getNorth();
        var south = mapBounds.getSouth();
        var mapSize = this.map.getSize();
        var width = mapSize.x;
        var height = mapSize.y;
        if (this.overlayBaseImageUrl != "" && this.overlayBaseImageUrl != 0) {
          if (this.overlay && this.map.hasLayer(this.overlay)) 
              this.map.removeLayer(this.overlay);
          var overlayImageUrl = this.overlayBaseImageUrl+ "&bbox=" + west + "," + south + "," + east + "," + north + "&width=" + width + "&height=" + height ;
          this.overlay = new L.imageOverlay (overlayImageUrl, mapBounds, {opacity: 0.4});
          this.overlay.addTo(this.map);
        }
    },
    DrawArea: function (selectedItemId) {
        var areaValue;
        var areaWkt = new Wkt.Wkt();

        //clear existing area object
        if (this.areaObj)
          this.map.removeLayer(this.areaObj);
        for (var i = 0; i < this.areaValues.length; i++) {
           if (this.areaValues[i].id == selectedItemId) {
              areaValue = this.areaValues[i].area;
              break;
           }
        }
        if (areaValue) {
            var geometryOK = true;
            try { // Catch any malformed WKT strings
                areaWkt.read(areaValue);
            } catch (e1) {
                try {
                    areaWkt.read(areaValue.replace('\n', '').replace('\r', '').replace('\t', ''));
                } catch (e2) {
                    if (e2.name === 'WKTError') {
                        PivotViewer.Debug.Log('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                        //return;
                        geometryOK = false;
                    }
                }
            }
            if (geometryOK) {
                this.areaObj = areaWkt.toObject({color:'#990000',fillColor:'#EEFFCC',fillOpacity:0.6});
                if (Wkt.isArray(this.areaObj)) {
                    for (var o = 0; o < this.areaObj.length; o++) { 
                        this.map.addLayer(this.areaObj[o]);
                    }
                } else 
                    this.map.addLayer(this.areaObj);
            }
        }
    },
    RedrawMarkers: function (selectedItemId) {
        this.selectedItemId = selectedItemId;

        // First clear all markers
        for (var i = 0; i < this.markers.length; i++) {
            this.map.removeLayer(this.markers[i]);
            //this.markers[i].setMap(null);
        }
        this.markers = [];

        this.CreateMarkers();
        this.CentreOnSelected (selectedItemId);
        this.DrawArea(selectedItemId);
    },
    ShowMapError: function () {
        var msg = '';
        msg = msg + 'The current data selection does not contain any location information that can be shown on a map<br><br>';
        msg = msg + '<br>Choose a different view<br>';
        $('.pv-wrapper').append("<div id=\"pv-dzlocation-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
        var t=setTimeout(function(){window.open("#pv-dzlocation-error","_self")},1000)
        return;
    },
    GetMapCentreX: function () {
        return this.mapCentreX;
    },
    SetMapCentreX: function (centrex) {
        this.mapCentreX = centrex;
    },
    SetMapInitCentreX: function (centrex) {
        this.mapCentreX = centrex;
        this.mapInitCentreX = centrex;
    },
    GetMapCentreY: function () {
        return this.mapCentreY;
    },
    SetMapCentreY: function (centrey) {
        this.mapCentreY = centrey;
    },
    SetMapInitCentreY: function (centrey) {
        this.mapCentreY = centrey;
        this.mapInitCentreY = centrey;
    },
    GetMapType: function () {
        return this.mapType;
    },
    SetMapType: function (type) {
        this.mapType = type;
    },
    SetMapInitType: function (type) {
        this.mapType = type;
        this.mapInitType = type;
    },
    GetMapZoom: function () {
        return this.mapZoom;
    },
    SetMapZoom: function (zoom) {
        this.mapZoom = zoom;
    },
    SetMapInitZoom: function (zoom) {
        this.mapZoom = zoom;
        this.mapInitZoom = zoom;
    },
    CentreOnSelected: function (selectedItemId) {
        for (j = 0; j <  this.locList.length; j++) {
            if (this.locList[j].id == selectedItemId) {
                if (this.locList[j].loc.lat != 0 && this.locList[j].loc.lng != 0)
                    this.map.panTo(this.locList[j].loc);
            }
        }
    },
    SetBookmark: function() {
        var centreLoc;
        var zoom = 8;
        //var type = google.maps.MapTypeId.ROADMAP;
        var gotLoc = false;

        centreLat = parseFloat(this.mapInitCentreX);
        centreLng = parseFloat(this.mapInitCentreY);
        if ((!isNaN(centreLat) && !isNaN(centreLng)) 
           && (centreLat != 0 && centreLng != 0)) {
            centreLoc = new L.LatLng(centreLat, centreLng);
            gotLoc = true;
        }
        bookmarkZoom = parseInt(this.mapInitZoom);
        if (!isNaN(bookmarkZoom)) 
            zoom = bookmarkZoom;

        //if (this.mapInitType && this.mapInitType != "")
        //    type = this.mapInitType;

        if (gotLoc)
            this.map.panTo(centreLoc);
        //this.map.setMapTypeId(type);
        this.map.setZoom(zoom);
    },
    SetOverlayBaseUrl: function(baseUrl) {
        this.overlayBaseImageUrl = baseUrl;
    },
    CreateLegend: function() {
        // Get width of the info panel (width of icon image = 30 )
        var width = $('.pv-mapview-legend').width() - 32;
        $('.pv-mapview-legend').empty();
        $('.pv-mapview-legend').append("<div class='pv-legend-heading' style='height:28px' title='" + this.sortFacet + "'>" + this.sortFacet + "</div>");
        var tableContent = "<table id='pv-legend-data' style='color:#484848;'>";
        for (var i = 0; i < this.buckets.length; i++) {
            var icon = new this.icons[i];
            tableContent += "<tr><td><img src='" + icon.options.iconUrl + "'></img></td>";
            if (this.buckets[i].startRange == this.buckets[i].endRange)
              tableContent += "<td><div style='overflow:hidden;white-space:nowrap;width:" + width + "px;text-overflow:ellipsis'>" + this.buckets[i].startRange + "</div></td></tr>"; 
            else
              tableContent += "<td><div style='overflow:hidden;white-space:nowrap;width:" + width + "px;text-overflow:ellipsis'>" + this.buckets[i].startRange + " to " + this.buckets[i].endRange + "</div></td></tr>"; 
        }
        tableContent +="</table>";
        $('.pv-mapview-legend').append(tableContent);
    },
    //Groups into buckets based on first n chars
    Bucketize: function (dzTiles, filterList, orderBy, stringFacets) {
        var bkts = [];
        for (var i = 0; i < dzTiles.length; i++) {
            if ($.inArray(dzTiles[i].facetItem.Id, filterList) >= 0) {
                var hasValue = false;
                for (var j = 0; j < dzTiles[i].facetItem.Facets.length; j++) {
                    if (dzTiles[i].facetItem.Facets[j].Name == orderBy && dzTiles[i].facetItem.Facets[j].FacetValues.length > 0) {

                        for (var m = 0; m < dzTiles[i].facetItem.Facets[j].FacetValues.length; m++) { 
                            var val = dzTiles[i].facetItem.Facets[j].FacetValues[m].Value;

                            var found = false;
                            for (var k = 0; k < bkts.length; k++) {
//this needs fixing to handle the whole range...
                                if (bkts[k].startRange == val) {
                                    // If item is not already in the bucket add it
                                    if ($.inArray(dzTiles[i].facetItem.Id, bkts[k].Ids) < 0)
                                        bkts[k].Ids.push(dzTiles[i].facetItem.Id);
                                    found = true;
                                }
                            }
                            if (!found)
                                bkts.push({ startRange: val, endRange: val, Ids: [dzTiles[i].facetItem.Id], Values: [val] });

                            hasValue = true;
                        }
                    }
                }
                //If not hasValue then add it as a (no info) item
                if (!hasValue) {
                    var val = "(no info)";
                    var found = false;
                    for (var k = 0; k < bkts.length; k++) {
                        if (bkts[k].startRange == val) {
                            bkts[k].Ids.push(dzTiles[i].facetItem.Id);
                            bkts[k].Values.push(val);
                            found = true;
                        }
                    }
                    if (!found)
                        bkts.push({ startRange: val, endRange: val, Ids: [dzTiles[i].facetItem.Id], Values: [val] });
                }
            }
        }

	// If orderBy is one of the string filters then only include buckets that are in the filter
	if ( stringFacets.length > 0 ) {
	    var sortIndex;
	    for ( var f = 0; f < stringFacets.length; f++ ) {
	        if ( stringFacets[f].facet == orderBy ) {
		    sortIndex = f;
		    break;
	        }
            }
	    if ( sortIndex != undefined  && sortIndex >= 0 ) {
	        var newBktsArray = [];
	        var filterValues = stringFacets[sortIndex].facetValue;
	        for ( var b = 0; b < bkts.length; b ++ ) {
		    var valueIndex = $.inArray(bkts[b].startRange, filterValues ); 
		    if (valueIndex >= 0 )
		        newBktsArray.push(bkts[b]);
	        }
	        bkts = newBktsArray;
	    }
	}

        var current = 0;
        while (bkts.length > 8) {
            if (current < bkts.length - 1) {
                bkts[current].endRange = bkts[current + 1].endRange;
                for (var i = 0; i < bkts[current + 1].Ids.length; i++) {
                    if ($.inArray(bkts[current+1].Ids[i], bkts[current].Ids) < 0) 
                        bkts[current].Ids.push(bkts[current + 1].Ids[i]);
                        if ($.inArray(bkts[current + 1].endRange, bkts[current].Values) < 0) 
                            bkts[current].Values.push(bkts[current + 1].endRange);
                }
                bkts.splice(current + 1, 1);
                current++;
            } else
                current = 0;
        }

        return bkts;
    },
	//http://stackoverflow.com/questions/979256/how-to-sort-an-array-of-javascript-objects
    SortBy: function (field, reverse, primer, filterValues) {

	var key = function (x, filterValues) {
		if (primer) {
			for (var i = x.facetItem.Facets.length - 1; i > -1; i -= 1) {
				if (x.facetItem.Facets[i].Name == field && x.facetItem.Facets[i].FacetValues.length > 0) {
                                    // If a numeric value could check if value is within filter 
                                    // bounds but will have been done already
                                    if ($.isNumeric(x.facetItem.Facets[i].FacetValues[0].Value) )
				            return primer(x.facetItem.Facets[i].FacetValues[0].Value);
                                    // If a string facet then could have a number of values.  Only
                                    // sort on values in the filter 
                                    else {                      
                                        for (var j = 0; j < x.facetItem.Facets[i].FacetValues.length; j++) {
                                            // Has a filter been set? If so, and it is the same facet as the sort
                                            // then sort on the items in the filter where possible (otherwise just 
                                            // use the first value.?
                                            if (filterValues.length > 0) {
                                                for (var k = 0; k < filterValues.length; k++) {
                                                    if (filterValues[k].facet == field) {
                                                         for (var l = 0; l < filterValues[k].facetValue.length; l++) {
                                                             if ( x.facetItem.Facets[i].FacetValues[j].Value == filterValues[k].facetValue[l]) {  
				                                 return primer(x.facetItem.Facets[i].FacetValues[j].Value);
                                                             }
                                                         }
                                                     } 
                                                }
                                            } 
                                        }
                                        return primer(x.facetItem.Facets[i].FacetValues[0].Value);
                                    }
                                }
			}
		}
		return null;
	};

	return function (a, b) {
		var A = key(a, filterValues), B = key(b, filterValues);
		return (A < B ? -1 : (A > B ? 1 : 0)) * [1, -1][+!!reverse];
	}
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///Timeline View
PivotViewer.Views.TimeView = PivotViewer.Views.IPivotViewerView.subClass({
    init: function () {
        this._super();
        this.selectedItemId;
        this.timeFacets = [];
        this.timeline;
        this.selectedFacet = 0;
        this.default_showBubble = Timeline.OriginalEventPainter.prototype._showBubble;
        var that = this;
    },
    Setup: function (width, height, offsetX, offsetY, tileMaxRatio) { 
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        this.currentOffsetX = this.offsetX;
        this.currentOffsetY = this.offsetY;
    },
    Filter: function (dzTiles, currentFilter, sortFacet, stringFacets, changingView, selectedItem) { 
        var that = this;
        if (!Modernizr.canvas)
            return;

        PivotViewer.Debug.Log('Timeline View Filtered: ' + currentFilter.length);

        if (changingView) {
            $('.pv-viewarea-canvas').fadeOut();
            $('.pv-tableview-table').fadeOut();
            $('.pv-toolbarpanel-maplegend').fadeOut();
            $('.pv-mapview-legend').fadeOut();
            $('.pv-mapview-canvas').fadeOut();
            $('.pv-toolbarpanel-sort').fadeOut();
            $('.pv-toolbarpanel-zoomslider').fadeOut();
            $('.pv-toolbarpanel-maplegend').fadeOut();
            $('.pv-toolbarpanel-timelineselector').fadeIn();
            $('.pv-toolbarpanel-zoomcontrols').css('border-width', '0');
            $('.pv-timeview-canvas').fadeIn();
            $('.pv-timeview-canvas').fadeIn(function(){
                if (selectedItem)
                    $.publish("/PivotViewer/Views/Item/Selected", [{id: selectedItem.Id, bkt: 0}]);
     
            });
            $('#MAIN_BODY').css('overflow', 'hidden');
        }

        this.tiles = dzTiles;
        this.currentFilter = currentFilter;

        $('.pv-timeview-canvas').css('height', this.height - 12 + 'px');
        $('.pv-timeview-canvas').css('width', this.width - 415 + 'px');

        // create the events
        this.CreateEventsData();

        //Check that there is event data
        if (this.timeFacets.length == 0 || this.timeFacets[this.selectedFacet].eventsData.length == 0) {
            this.ShowTimeError();
            return;
        } 

        $('.pv-toolbarpanel-timelineselector').empty();
        var facetSelectControl = "<select id='pv-timeline-selectcontrol' style='width:126px'>";
        for (var facet = 0; facet < this.timeFacets.length; facet++) {
            if (facet == this.selectedFacet) 
                facetSelectControl += "<option selected='selected' value='" + this.timeFacets[facet].name + "'>" + this.timeFacets[facet].name + "</option>";
            else 
                facetSelectControl += "<option value='" + this.timeFacets[facet].name + "'>" + this.timeFacets[facet].name + "</option>";
        }
        facetSelectControl += "</select>";
        $('.pv-toolbarpanel-timelineselector').append(facetSelectControl);
        $('#pv-timeline-selectcontrol').change(function() {
           selectedFacetName = $('#pv-timeline-selectcontrol').val();
           for (var i = 0; i < that.timeFacets.length; i++) {
               if (that.timeFacets[i].name == selectedFacetName) {
                   that.selectedFacet = i;
                   break;
               }
           }
           that.RefreshView();
           // Centre on selected
           for (var j = 0; j < that.timeFacets[that.selectedFacet].eventsData.length; j++) {
               if (that.timeFacets[that.selectedFacet].eventsData[j]._id == that.selectedItemId) {
                   that.timeline.getBand(0).setCenterVisibleDate(that.timeFacets[that.selectedFacet].eventsData[j].getStart());
                   break;
               }
           }
            $.publish("/PivotViewer/Views/Item/Updated", null);
        });

        var eventSource = new Timeline.DefaultEventSource();
        var theme = Timeline.ClassicTheme.create();
        var selectedTile;
        Timeline.OriginalEventPainter.prototype._showBubble = function(x, y, evt) {
            if (that.selectedItemId == evt._id) {
                 that.Selected("");
                 $.publish("/PivotViewer/Views/Update/GridSelection", [{selectedItem: that.selectedItemId, selectedTile: selectedTile}]);
            } else {
                for (var i = 0; i < that.tiles.length; i++) {
                    if (that.tiles[i].facetItem.Id == evt._id) {
                        selectedTile = that.tiles[i];
                        $.publish("/PivotViewer/Views/Update/GridSelection", [{selectedItem: evt._id, selectedTile: selectedTile}]);
                        break;
                    }
                }
                //that.default_showBubble.apply(this, arguments);
            }
        }
        theme.autoWidth = false; // Set the Timeline's "width" automatically.

        var bandInfos = [
            Timeline.createBandInfo({
                eventSource:    eventSource,
                date:           this.timeFacets[this.selectedFacet].eventsData[0].getStart(),
                width:          "80%",
                intervalUnit:   this.timeFacets[this.selectedFacet].interval0,
                intervalPixels: 100,
                theme :theme
            }),
            Timeline.createBandInfo({
                overview:       true,
                date:           this.timeFacets[this.selectedFacet].eventsData[0].getStart(),
                eventSource:    eventSource,
                width:          "20%",
                intervalUnit:   this.timeFacets[this.selectedFacet].interval1,
                intervalPixels: 200,
                theme :theme
            })
        ];

        bandInfos[1].highlight = true;
        bandInfos[1].syncWith = 0;


        bandInfos[1].decorators = [
            new Timeline.SpanHighlightDecorator({
                inFront:    false,
                color:      "#FFC080",
                opacity:    30,
                startLabel: "Begin",
                endLabel:   "End",
                theme:      theme
            })
        ];


        this.timeline = Timeline.create($('.pv-timeview-canvas')[0], bandInfos, Timeline.HORIZONTAL);

        // show loading message
        this.timeline.showLoadingMessage();

        Timeline.loadJSON("timeline.json",
              function(json, url) { eventSource.loadJSON(json,url); });

        // dismiss loading message
        this.timeline.hideLoadingMessage();
        this.RefreshView();

        if (changingView && selectedItem) {
            for (var i = 0; i < this.timeFacets[this.selectedFacet].eventsData.length; i++) {
                if (this.timeFacets[this.selectedFacet].eventsData[i]._id == selectedItem.Id) {
                    this.timeline.getBand(0).setCenterVisibleDate(this.timeFacets[this.selectedFacet].eventsData[i].getStart());
                    break;
                }
            }
        }
    },
    GetUI: function () { return ''; },
    GetButtonImage: function () {
        return 'images/TimeView.png';
    },
    GetButtonImageSelected: function () {
        return 'images/TimeViewSelected.png';
    },
    GetViewName: function () { return 'Time View'; },
    CreateEventsData: function () { 
        // Empty the events array.
        this.timeFacets = [];

        for (var i = 0; i < this.categories.length; i++) {
            // Use first datetime category for the timeline data
            if (this.categories[i].Type == PivotViewer.Models.FacetType.DateTime) {
                var timeFacetName = this.categories[i].Name;
                if (this.categories[i].decadeBuckets.length > 3){
                    interval0 = Timeline.DateTime.YEAR;
                    interval1 = Timeline.DateTime.DECADE;
                } else if (this.categories[i].yearBuckets.length > 3){
                    interval0 = Timeline.DateTime.MONTH;
                    interval1 = Timeline.DateTime.YEAR;
                } else if (this.categories[i].monthBuckets.length > 3){
                    interval0 = Timeline.DateTime.DAY;
                    interval1 = Timeline.DateTime.MONTH;
                } else if (this.categories[i].dayBuckets.length > 3){
                    interval0 = Timeline.DateTime.HOUR;
                    interval1 = Timeline.DateTime.DAY;
                } else {
                    interval0 = Timeline.DateTime.DAY;
                    interval1 = Timeline.DateTime.MINUTE;
                }
                this.timeFacets.push({name: timeFacetName, interval0: interval0, interval1: interval1, eventsData: [] });
            }
        }
 
        // Create the events data for each time facet
        for (var facet = 0; facet < this.timeFacets.length; facet++) {
            for (var j = 0; j < this.currentFilter.length; j++) {
                for (var l = 0; l < this.tiles.length; l++) {
                    if (this.tiles[l].facetItem.Id == this.currentFilter[j]) {
                        //Tile is in scope
                        var timeValue = 0;
                        for (var k = 0; k < this.tiles[l].facetItem.Facets.length; k++) {
                           if (this.tiles[l].facetItem.Facets[k].Name == this.timeFacets[facet].name) {
                             timeValue = this.tiles[l].facetItem.Facets[k].FacetValues[0].Value;
                             break;
                           }
                        }
                        if (timeValue != 0){
                            var evt = new Timeline.DefaultEventSource.Event({
                                id: this.tiles[l].facetItem.Id,
                                start: new Date(timeValue),
                                isDuration: false,
                                text: this.tiles[l].facetItem.Name,
                                image: this.tiles[l]._images ? this.tiles[l]._images[0].attributes[0].value : null,
                                link: this.tiles[l].facetItem.Href,
                                caption: this.tiles[l].facetItem.Name,
                                description: this.tiles[l].facetItem.Description,
                             });
                             this.timeFacets[facet].eventsData.push(evt);         
                        } 
                    }
                }
            }
        }
    },
    SetFacetCategories: function (collection) {
        this.categories = collection.FacetCategories;
    },
    GetFacetCategoryType: function (name) {
        for (i = 0; i < this.categories.length; i++) {
            if (this.categories[i].Name == name)
                return this.categories[i].Type;
        }
        // should never get here...
        return "not set";
    },
    ShowTimeError: function () {
        var msg = '';
        msg = msg + 'The current data selection does not contain any information that can be shown on a timeline<br><br>';
        msg = msg + '<br>Choose a different view<br>';
        $('.pv-wrapper').append("<div id=\"pv-dzlocation-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
        var t=setTimeout(function(){window.open("#pv-dzlocation-error","_self")},1000)
        return;
    },
    RefreshView: function () {
        this.timeline.getBand(0).getEventSource().clear();
        this.timeline.getBand(0).getEventSource().addMany(this.timeFacets[this.selectedFacet].eventsData);
        this.timeline.paint();
    },
    Selected: function (selectedItemId) {
        this.selectedItemId = selectedItemId;

        // Centre on selected
        for (var i = 0; i < this.timeFacets[this.selectedFacet].eventsData.length; i++) {
            if (this.timeFacets[this.selectedFacet].eventsData[i]._id == this.selectedItemId) {
                this.timeline.getBand(0).setCenterVisibleDate(this.timeFacets[this.selectedFacet].eventsData[i].getStart());
                break;
            }
        }

        // Colour the markers
        for (var facet = 0; facet < this.timeFacets.length; facet++) {
            for (var item = 0; item < this.timeFacets[facet].eventsData.length; item++) {
                if (this.timeFacets[facet].eventsData[item]._id == this.selectedItemId) {
                    this.timeFacets[facet].eventsData[item]._icon = "scripts/timeline_js/images/dark-red-circle.png";
                } else 
                    this.timeFacets[facet].eventsData[item]._icon = "scripts/timeline_js/images/blue-circle.png";
            }
        }

        this.RefreshView();
    },
    SetSelectedFacet: function (facet) {
        if (!facet)
            this.selectedFacet = 0;
        else  
            this.selectedFacet = facet;
    },
    GetSelectedFacet: function () {
        return this.selectedFacet;
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///
/// Table view
///
PivotViewer.Views.TableView = PivotViewer.Views.IPivotViewerView.subClass({
    init: function () {
        this._super();
        var that = this;
        var currentFilter;
        var selectedFacet = "";
        var selectedId = "";
        var sortKey = 'pv-key';
        var sortReverseEntity = true;
        var sortReverseAttribute = true;
        var sortReverseValue = true;
    },
    Setup: function (width, height, offsetX, offsetY, tileMaxRatio) {
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.currentWidth = this.width;
        this.currentHeight = this.height;
        this.currentOffsetX = this.offsetX;
        this.currentOffsetY = this.offsetY;

        $('.pv-viewpanel').append("<div style='visibility:hidden;position:relative;' id='pv-table-loader'><img src='images/loading.gif'></img></div>");
        $('#pv-table-loader').css('top', (this.height / 2) - 33 +'px');
        $('#pv-table-loader').css('left', (this.width / 2) - 43 +'px');
    },
    Filter: function (dzTiles, currentFilter, sortFacet, stringFacets, changingView, selectedItem) {
        var that = this;
        if (!Modernizr.canvas)
            return;

        PivotViewer.Debug.Log('Table View Filtered: ' + currentFilter.length);

        if (changingView) {
            $('.pv-viewarea-canvas').fadeOut();
            $('.pv-toolbarpanel-maplegend').fadeOut();
            $('.pv-mapview-legend').fadeOut();
            $('.pv-mapview-canvas').fadeOut();
            $('.pv-mapview2-canvas').fadeOut();
            $('.pv-timeview-canvas').fadeOut();
            $('.pv-toolbarpanel-sort').fadeIn();
            $('.pv-toolbarpanel-timelineselector').fadeOut();
            $('.pv-toolbarpanel-mapview').fadeOut();
            $('.pv-toolbarpanel-zoomslider').fadeOut();
            $('.pv-toolbarpanel-zoomcontrols').css('border-width', '0');
            $('#MAIN_BODY').css('overflow', 'auto');
            $('.pv-tableview-table').fadeIn(function(){
                if (selectedItem)
                    $.publish("/PivotViewer/Views/Item/Selected", [{id: selectedItem.Id, bkt: 0}]);
            });
        }

        this.tiles = dzTiles;
        this.currentFilter = currentFilter;

        this.selectedId = "";
        this.sortReverseEntity = true;
        this.sortReverseAttribute = true;
        this.sortReverseValue = true;

        this.CreateTable ( currentFilter, this.selectedFacet );
        this.init = false;
    },
    GetUI: function () {
        if (Modernizr.canvas)
            return "";
        else
            return "<div class='pv-viewpanel-unabletodisplay'><h2>Unfortunately this view is unavailable as your browser does not support this functionality.</h2>Please try again with one of the following supported browsers: IE 9+, Chrome 4+, Firefox 2+, Safari 3.1+, iOS Safari 3.2+, Opera 9+<br/><a href='http://caniuse.com/#feat=canvas'>http://caniuse.com/#feat=canvas</a></div>";
    },
    GetButtonImage: function () {
        return 'images/TableView.png';
    },
    GetButtonImageSelected: function () {
        return 'images/TableViewSelected.png';
    },
    GetViewName: function () {
        return 'Table View';
    },
    CellClick: function (columnId, cells) {
        PivotViewer.Debug.Log('CellClick');
        if (columnId == 'pv-key') {
            // selected item name need to get the id and publish selected event 
            //var selectedItemName = cells[0].innerHTML;
            var selectedItemName = cells[0].textContent.trim();
            var selectedItemId = -1;

            for (var i = 0; i < this.tiles.length; i++) {
                if (this.tiles[i].facetItem.Name == selectedItemName) {
                    selectedItemId = this.tiles[i].facetItem.Id;
                    break;
                }
            }

            if (selectedItemId >= 0 && selectedItemId != this.selectedId) {
                this.selectedId = selectedItemId;
                $.publish("/PivotViewer/Views/Item/Selected", [{id: selectedItemId, bkt: 0}]);
            }
            else if (selectedItemId >= 0 && selectedItemId == this.selectedId) {
                this.selectedId = "";   
                $.publish("/PivotViewer/Views/Item/Selected", [{id: "", bkt: 0}]);
            }

        } else if (columnId == 'pv-facet'){
            var filter = [];

            if (this.selectedId == "" || this.selectedId == null )
                filter = this.currentFilter;
            else
                filter[0] = this.selectedId;

            if (this.selectedFacet == "" || this.selectedFacet == null) {
                this.selectedFacet = cells[1].getAttribute('data-attribute-full-name');
                this.CreateTable( filter, this.selectedFacet, this.sortKey );
            } else {
                this.selectedFacet = "";
                this.CreateTable( filter, "" );
            }
            $.publish("/PivotViewer/Views/Item/Updated", null);
        } else if (columnId == 'pv-value'){
            // filter on this value...
            $.publish("/PivotViewer/Views/Item/Filtered", [{ Facet: cells[1].getAttribute('data-attribute-full-name'), Item: cells[2].textContent.trim(), Values: null, ClearFacetFilters: true }]);
        }
    },
    CreateTable: function ( currentFilter, selectedFacet, sortKey, sortReverse ) {
        var that = this;
        var table = $('#pv-table');
        var showAllFacets = false; 
        var tableRows = new Array();
        var sortIndex = 0;
        table.empty();
        var sortImage;
        var offset;

        if (selectedFacet == null || selectedFacet == "" || typeof (selectedFacet) == undefined)
          showAllFacets = true;  
        $('.pv-tableview-table').css('height', this.height - 12 + 'px');
        $('.pv-tableview-table').css('width', this.width - 415 + 'px');

        if (sortReverse) {
            sortImage = "images/sort-up.png";
            //offset = +40;
        } else {
            sortImage = "images/sort-down.png";
            //offset = -40;
        }

        var oddOrEven = 'odd-row';
        var tableContent = "<table id='pv-table-data' style='color:#484848;'><tr class='pv-tableview-heading'><th id='pv-key' title='Sort on subject name'>Subject";
        if (sortKey == 'pv-key')
            tableContent += " <img style='position:relative;top:" + offset + "' src='" + sortImage + "'></img>";
        tableContent += "</th><th id='pv-facet' title='Sort on predicate name'>Predicate";
        if (sortKey == 'pv-facet')
            tableContent += " <img style='position:relative;top:" + offset + "' src='" + sortImage + "'></img>";
        tableContent += "</th><th id='pv-value' title='Sort on object'>Object";
        if (sortKey == 'pv-value')
            tableContent += " <img style='position:relative;top:" + offset + "' src='" + sortImage + "'></img>";
        tableContent += "</th></tr>";

        for (var i = 0; i < currentFilter.length; i++) {
            for (var j = 0; j < this.tiles.length; j++) {
                if (this.tiles[j].facetItem.Id == currentFilter[i]) {
                   var entity = this.tiles[j].facetItem.Name;
                   if ( showAllFacets || selectedFacet == 'Description') {
                      var sortKeyValue;
                      if (sortKey == 'pv-key')
                        sortKeyValue = entity;
                      else if (sortKey == 'pv-facet')
                        sortKeyValue = 'Description';
                      else if (sortKey == 'pv-value')
                        sortKeyValue = this.tiles[j].facetItem.Description;

                      // Only add a row for the Description if there is one
                      if (this.tiles[j].facetItem.Description) {
                          // Link out image if item has href
                          if (this.tiles[j].facetItem.Href) {
                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' title='Follow the link' src='images/goout.gif'></img></a></a></td><td id='pv-facet' title='Show only this predicate' style='color:#009933;cursor:pointer'>Description</td><td id='pv-value'>" + this.tiles[j].facetItem.Description + "</td></tr>"});
                          } else {
                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' class='tooltip' title='Toggle item selection'>" + entity + "</td><td id='pv-facet' title='Show only this predicate' style='color:#009933;cursor:pointer'>Description</td><td id='pv-value'>" + this.tiles[j].facetItem.Description + "</td></tr>"});
                          }
                   
                          oddOrEven = 'even-row';
                      }
                   }

                   if (oddOrEven == 'odd-row')
                      oddOrEven = 'even-row';
                   else
                       oddOrEven = 'odd-row';

                   if ( showAllFacets) {
                       for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++){
                           var attribute = this.tiles[j].facetItem.Facets[k].Name;
                           for (l = 0; l < this.tiles[j].facetItem.Facets[k].FacetValues.length; l++) {
                              var value = this.tiles[j].facetItem.Facets[k].FacetValues[l].Value;

                              var sortKeyValue;
                              if (sortKey == 'pv-key')
                                sortKeyValue = entity;
                              else if (sortKey == 'pv-facet')
                                sortKeyValue = attribute;
                              else if (sortKey == 'pv-value')
                                sortKeyValue = value;

                              // Colour blue if in the filter
                              if (this.IsFilterVisible (attribute)) {
                                  // Link out image if item has href
                                  if (this.tiles[j].facetItem.Href) {
                                      // Value is uri
                                      if (this.IsUri(value))
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet'  title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value' title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + " " + "<a href=" + value + " target=\"_blank\"><img style='cursor:default;' id=pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td></tr>"});
                                      else
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet'  title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value' title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + "</td></tr>"});
                                  } else {
                                      // Value is uri
                                      if (this.IsUri(value))
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection'>" + entity + "</td><td id='pv-facet'  title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value' title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + " " + "<a href=" + value + " target=\"_blank\"><img style='cursor:default;' id=pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td></tr>"});
                                      else
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection'>" + entity + "</td><td id='pv-facet'  title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'  title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + "</td></tr>"});
                                  }
                             } else {
                                  // Link out image if item has href
                                  if (this.tiles[j].facetItem.Href) { 
                                      // Value is uri
                                      if (this.IsUri(value))
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet' title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'><a href=" + value + ">" + value + "</a></td></tr>"});
                                       else
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet' title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'>" + value + "</td></tr>"});
                                  } else {
                                      // Value is uri
                                      if (this.IsUri(value))
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Select this value'>" + entity + "</td><td id='pv-facet' title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'><a href" + value + ">" + value + "</a></td></tr>"});
                                       else
                                          tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Select this value'>" + entity + "</td><td id='pv-facet' title='Show only this predicate' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'>" + value + "</td></tr>"});
                                 }
                             } 
                             if (oddOrEven == 'odd-row')
                                 oddOrEven = 'even-row';
                             else
                               oddOrEven = 'odd-row';
                           }
                       }
                   } else {
                       for (k = 0; k < this.tiles[j].facetItem.Facets.length; k++){
                           var attribute = this.tiles[j].facetItem.Facets[k].Name;
                           if (attribute == selectedFacet) {
                               for (l = 0; l < this.tiles[j].facetItem.Facets[k].FacetValues.length; l++) {
                                  var value = this.tiles[j].facetItem.Facets[k].FacetValues[l].Value;

                                  var sortKeyValue;
                                  if (sortKey == 'pv-key')
                                    sortKeyValue = entity;
                                  else if (sortKey == 'pv-facet')
                                    sortKeyValue = attribute;
                                  else if (sortKey == 'pv-value')
                                    sortKeyValue = value;

                                  // Colour blue if in the filter
                                  if (this.IsFilterVisible (attribute)) {
                                      // Link out image if item has href
                                      if (this.tiles[j].facetItem.Href) {
                                          // Value is uri
                                          if (this.IsUri(value))
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value' class='tooltipinter 'title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + " " + "<a href=" + value + " target=\"_blank\"><img style='cursor:default;' id=pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td></tr>"});
                                           else
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value' title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + "</td></tr>"});
                                      } else {
                                          // Value is uri
                                          if (this.IsUri(value))
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection'>" + entity + "</td><td id='pv-facet' class-'tooltipcustom' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value' title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + " " + "<a href=" + value + " target=\"_blank\"><img style='cursor:default;' id=pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td></tr>"});
                                           else
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection'>" + entity + "</td><td id='pv-facet' class-'tooltipcustom' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value' title='Filter on this value' style='color:#009933;cursor:pointer'>" + value + "</td></tr>"});
                                    }
                               } else {
                                      // Link out image if item has href
                                      if (this.tiles[j].facetItem.Href) { 
                                          // Value is uri
                                          if (this.IsUri(value))
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Click the cell to select this item' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'><a href=" + value + ">" + value + "</a></td></tr>"});
                                          else
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Click the cell to select this item' style='color:#009933;cursor:pointer'>" + entity + " " + "<a href=" + this.tiles[j].facetItem.Href.replace(/'/g, "%27") + " target=\"_blank\"><img style='cursor:default;' id='pv-linkout' title='Follow the link' src='images/goout.gif'></img></a></td><td id='pv-facet' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'>" + value + "</td></tr>"});
                                      } else {
                                          // Value is uri
                                          if (this.IsUri(value))
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection'>" + entity + "</td><td id='pv-facet' class-'tooltipcustom' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'><a href" + value + ">" + value + "</a></td></tr>"});
                                          else
                                              tableRows.push({key: sortKeyValue, value: "<tr class='pv-tableview-" + oddOrEven +"'><td id='pv-key' title='Toggle item selection'>" + entity + "</td><td id='pv-facet' class-'tooltipcustom' title='Clear predicate selection' style='color:#009933;cursor:pointer' data-attribute-full-name=" + attribute + ">" + PivotViewer.Utils.StripVirtcxml(attribute) + "</td><td id='pv-value'>" + value + "</td></tr>"});
                                   }
                               } 
                               if (oddOrEven == 'odd-row')
                                   oddOrEven = 'even-row';
                               else
                                   oddOrEven = 'odd-row';
                               }
                               break;
                           }
                       }
                   }
               }
            }
        }

        if (tableRows.length == 0) {
            if (showAllFacets == true) {
                var msg = '';
                msg = msg + 'There is not data to show about the selected items';
                $('.pv-wrapper').append("<div id=\"pv-dztable-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                var t=setTimeout(function(){window.open("#pv-dztable-error","_self")},1000)
                return;
            } else
                this.CreateTable( currentFilter, "", sortKey, sortReverse )
        } else { 
            tableRows.sort(function(a, b){
              if(a.key > b.key){
                return 1;
              }
              else if(a.key < b.key){
                return -1;
              } 
              return 0;
            });
         
            if (sortReverse)
              tableRows.reverse();
         
            for (var i = 0; i < tableRows.length; i++) {
               tableContent += tableRows[i].value;
            }
         
            tableContent += "</table>";
            table.append(tableContent);
            $('#pv-table-data').colResizable({disable:true});
            $('#pv-table-data').colResizable({disable:false});

            // Table view events
            $('.pv-tableview-heading').on('click', function (e) {
                $('#pv-table-loader').show();
                var id = e.originalEvent.target.id;
         
                var filter = [];
         
                if (that.selectedId == "" || that.selectedId == null )
                    filter = that.currentFilter;
                else
                    filter[0] = that.selectedId;
         
                var sortReverse;
                if (id == 'pv-key') {
                    if (that.sortReverseEntity)
                      sortReverse = false;
                    else 
                      sortReverse = true;
                    that.sortReverseEntity = sortReverse;
                } else if (id == 'pv-facet'){
                    if (that.sortReverseAttribute)
                      sortReverse = false;
                    else 
                      sortReverse = true;
                    that.sortReverseAttribute = sortReverse;
                } else if (id == 'pv-value'){
                    if (that.sortReverseValue)
                      sortReverse = false;
                    else 
                      sortReverse = true;
                    that.sortReverseValue = sortReverse;
                }
         
                that.sortKey = id;
                that.CreateTable (filter, that.selectedFacet, id, sortReverse);
                $('#pv-table-loader').fadeOut();
            }); 
            $('.pv-tableview-odd-row').on('click', function (e) {
                $('#pv-table-loader').show();
                var id = e.originalEvent.target.id;
                that.CellClick(id, e.currentTarget.cells );
                $('#pv-table-loader').fadeOut();
;
            }); 
            $('.pv-tableview-even-row').on('click', function (e) {
                $('#pv-table-loader').show();
                var id = e.originalEvent.target.id;
                that.CellClick(id, e.currentTarget.cells );
                $('#pv-table-loader').fadeOut();
            }); 
        }
    },
    Selected: function (itemId) {
        var filter = [];
        if (itemId == "" || itemId == null || typeof(itemId) == undefined ) {
            this.selectedId = "";
            this.CreateTable (this.currentFilter, this.selectedFacet);
        } else {
            filter[0] = itemId;
            this.selectedId = itemId;
            this.CreateTable (filter, this.selectedFacet);
        }
    },
    SetFacetCategories: function (collection) {
        this.categories = collection.FacetCategories;
    },
    IsFilterVisible: function (attribute) {
        var visible = null;

        for (i = 0; i < this.categories.length; i++) {
            if (this.categories[i].Name == attribute)
                visible = this.categories[i].IsFilterVisible;
        }

        if (visible != null)
            return visible;
        else
            return false;
    },
    IsUri: function (facetValue) {
      var stringVal = facetValue;
      var retValue = false;
      if (typeof(facetValue) == "string") {
          if (stringVal.substring(0, 5) == 'http:')
            retValue = true;
          if (stringVal.substring(0, 6) == 'https:')
            retValue = true;
      }
      return retValue;
    },
    SetSelectedFacet: function (facet) {
        this.selectedFacet = facet;
    },
    GetSelectedFacet: function () {
        return this.selectedFacet;
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///
/// Tile Controller
/// used to create the initial tiles and their animation based on the locations set in the views
///
PivotViewer.Views.TileController = Object.subClass({
    init: function (ImageController) {
        this._tiles = [];
        this._helpers = [];
        this._helperText = "";
        this._easing = new Easing.Easer({ type: "circular", side: "both" });
        this._imageController = ImageController;
    },
    initTiles: function (pivotCollectionItems, baseCollectionPath, canvasContext) {
        //Set the initial state for the tiles
        for (var i = 0; i < pivotCollectionItems.length; i++) {
            var tile = new PivotViewer.Views.Tile(this._imageController);
            tile.facetItem = pivotCollectionItems[i];
            tile.CollectionRoot = baseCollectionPath.replace(/\\/gi, "/").replace(/\.xml/gi, "");
            this._canvasContext = canvasContext;
            tile.context = this._canvasContext;
            tileLocation = new PivotViewer.Views.TileLocation();
            tile._locations.push(tileLocation);
            this._tiles.push(tile);
        }
        return this._tiles;
    },

    AnimateTiles: function (doInitialSelection, selectedId) {
        var that = this;
        this._started = true;
        var context = null;
        var isAnimating = false;

        if (this._tiles.length > 0 && this._tiles[0].context != null) {
            context = this._tiles[0].context;

            //TODO Seen this error, investigate this for performance: http://stackoverflow.com/questions/7787219/javascript-ios5-javascript-execution-exceeded-timeout

            var isZooming = false;
            //Set tile properties
            for (var i = 0; i < this._tiles.length; i++) {
                //for each tile location...
                for (l = 0; l < this._tiles[i]._locations.length; l++) {
                     var now = PivotViewer.Utils.Now() - this._tiles[i].start,
                     end = this._tiles[i].end - this._tiles[i].start;
                     //use the easing function to determine the next position
                     if (now <= end) {
                         //at least one tile is moving
                         //isAnimating = true;
 
                         //if the position is different from the destination position then zooming is happening
                         if (this._tiles[i]._locations[l].x != this._tiles[i]._locations[l].destinationx || this._tiles[i]._locations[l].y != this._tiles[i]._locations[l].destinationy)
                             isZooming = true;
 
                         this._tiles[i]._locations[l].x = this._easing.ease(
                             now, 										// curr time
                             this._tiles[i]._locations[l].startx,                                                       // start position
                            this._tiles[i]._locations[l].destinationx - this._tiles[i]._locations[l].startx, // relative end position

                             end											// end time
                         );
 
                         this._tiles[i]._locations[l].y = this._easing.ease(
                         now,
                         this._tiles[i]._locations[l].starty,
                         this._tiles[i]._locations[l].destinationy - this._tiles[i]._locations[l].starty,
                         end
                     );
 
                         //if the width/height is different from the destination width/height then zooming is happening
                         if (this._tiles[i].width != this._tiles[i].destinationWidth || this._tiles[i].height != this._tiles[i].destinationHeight)
                             isZooming = true;
 
                         this._tiles[i].width = this._easing.ease(
                         now,
                         this._tiles[i].startwidth,
                         this._tiles[i].destinationwidth - this._tiles[i].startwidth,
                         end
                     );
 
                         this._tiles[i].height = this._easing.ease(
                         now,
                         this._tiles[i].startheight,
                         this._tiles[i].destinationheight - this._tiles[i].startheight,
                         end
                     );
                     } else {
                         this._tiles[i]._locations[l].x = this._tiles[i]._locations[l].destinationx;
                         this._tiles[i]._locations[l].y = this._tiles[i]._locations[l].destinationy;
                         this._tiles[i].width = this._tiles[i].destinationwidth;
                         this._tiles[i].height = this._tiles[i].destinationheight;
			 // if now and end are numbers when we get here then the animation 
			 // has finished
			 if (!isNaN(now) && !isNaN(end) && doInitialSelection) {
                             var selectedTile = "";
                             for ( t = 0; t < this._tiles.length; t ++ ) {
                                 if (this._tiles[t].facetItem.Id == selectedId) {
                                    selectedTile = this._tiles[t];
                                    break;
                                 }
                             }
	                     if (selectedId && selectedTile) 
                        	$.publish("/PivotViewer/Views/Canvas/Click", [{ x: selectedTile._locations[selectedTile.selectedLoc].destinationx, y: selectedTile._locations[selectedTile.selectedLoc].destinationy}]);
                                doInitialSelection = false;
                                selectedId = 0;
                        }
                     }
 
                     //check if the destination will be in the visible area
                     if (this._tiles[i]._locations[l].destinationx + this._tiles[i].destinationwidth < 0 || this._tiles[i]._locations[l].destinationx > context.canvas.width || this._tiles[i]._locations[l].destinationy + this._tiles[i].destinationheight < 0 || this._tiles[i]._locations[l].destinationy > context.canvas.height)
                         this._tiles[i].destinationVisible = false;
                     else
                         this._tiles[i].destinationVisible = true;
                 }
             }
         }

        //fire zoom event
        if (this._isZooming != isZooming) {
            this._isZooming = isZooming;
            $.publish("/PivotViewer/ImageController/Zoom", [this._isZooming]);
        }

        //If animating then (most likely) all tiles will need to be updated, so clear the entire canvas
        //if (isAnimating) {
            //Clear drawing area
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        //}

        //once properties set then draw
        for (var i = 0; i < this._tiles.length; i++) {
            //only draw if in visible area
            for (var l = 0; l < this._tiles[i]._locations.length; l++) {
                if (this._tiles[i]._locations[l].x + this._tiles[i].width > 0 && this._tiles[i]._locations[l].x < context.canvas.width && this._tiles[i]._locations[l].y + this._tiles[i].height > 0 && this._tiles[i]._locations[l].y < context.canvas.height) {
                if (isAnimating)
                    this._tiles[i].DrawEmpty(l);
                else
                    this._tiles[i].Draw(l);
                }
            }
        }

        //Helpers
        /*
        if (debug) {
            //Draw point if one requested
            if (this._helpers.length > 0) {
                for (var i = 0; i < this._helpers.length; i++) {
                    this._canvasContext.beginPath();
                    this._canvasContext.moveTo(this._helpers[i].x, this._helpers[i].y);
                    this._canvasContext.arc(this._helpers[i].x + 1, this._helpers[i].y + 1, 10, 0, Math.PI * 2, true);
                    this._canvasContext.fillStyle = "#FF0000";
                    this._canvasContext.fill();
                    this._canvasContext.beginPath();
                    this._canvasContext.rect(this._helpers[i].x + 25, this._helpers[i].y - 40, 50, 13);
                    this._canvasContext.fillStyle = "white";
                    this._canvasContext.fill();
                    this._canvasContext.fillStyle = "black";
                    this._canvasContext.fillText(this._helpers[i].x + ", " + this._helpers[i].y, this._helpers[i].x + 30, this._helpers[i].y - 30);
                }
            }

            if (this._helperText.length > 0) {
                this._canvasContext.beginPath();
                this._canvasContext.rect(220, 5, 500, 14);
                this._canvasContext.fillStyle = "white";
                this._canvasContext.fill();
                this._canvasContext.fillStyle = "black";
                this._canvasContext.fillText(this._helperText, 225, 14);
            }
        }
        */

        // request new frame
        if (!this._breaks) {
            requestAnimFrame(function () {
                that.AnimateTiles(doInitialSelection, selectedId);
            });
        } else {
            this._started = false;
            return;
        }
    },

    BeginAnimation: function (doInitialSelection, viewerStateSelected) {
        if (!this._started && this._tiles.length > 0) {
            this._breaks = false;
            this.AnimateTiles(doInitialSelection, viewerStateSelected);
        }
    },
    StopAnimation: function () {
        this._breaks = true;
    },
    SetLinearEasingBoth: function () {
        this._easing = new Easing.Easer({ type: "linear", side: "both" });
    },
    SetCircularEasingBoth: function () {
        this._easing = new Easing.Easer({ type: "circular", side: "both" });
    },
    SetQuarticEasingOut: function () {
        this._easing = new Easing.Easer({ type: "quartic", side: "out" });
    },
    GetMaxTileRatio: function () {
    //    return this._imageController.Height / this._imageController.MaxWidth;
        return this._imageController.MaxRatio;
    },
    DrawHelpers: function (helpers) {
        this._helpers = helpers;
    },
    DrawHelperText: function (text) {
        this._helperText = text;
    }
});

///
/// Tile
/// Used to contain the details of an individual tile, and to draw the tile on a given canvas context
///
PivotViewer.Views.Tile = Object.subClass({
    init: function (TileController) {
        if (!(this instanceof PivotViewer.Views.Tile)) {
            return new PivotViewer.Views.Tile(TileController);
        }
        this._controller = TileController;
        this._imageLoaded = false;
        this._selected = false;
        this._images = null;
        this._locations = [];
    },

    IsSelected: function () {
       return this._selected;
    },

    Draw: function (loc) {
        //Is the tile destination in visible area?
        if (this.destinationVisible) {
            this._images = this._controller.GetImages(this.facetItem.Img, this.width, this.height);
        }

        if (this._images != null) {
            if (typeof this._images == "function") {
                //A DrawLevel function returned - invoke
                this._images(this.facetItem, this.context, this._locations[loc].x + 4, this._locations[loc].y + 4, this.width - 8, this.height - 8);
            }

            else if (this._images.length > 0 && this._images[0] instanceof Image) {
                //if the collection contains an image
                var completeImageHeight = this._controller.GetHeight(this.facetItem.Img);
                var displayHeight = this.height - 8;
                var displayWidth = Math.ceil(this._controller.GetWidthForImage(this.facetItem.Img, displayHeight));
                //Narrower images need to be centered 
                blankWidth = (this.width - 8) - displayWidth;

                // Handle displaying the deepzoom image tiles (move to deepzoom.js)
                if (this._controller instanceof PivotViewer.Views.DeepZoomImageController) {
                    for (var i = 0; i < this._images.length; i++) {
                        // We need to know where individual image tiles go
                        var source = this._images[i].src;
                        var tileSize = this._controller._tileSize;
                        var n = source.match(/[0-9]+_[0-9]+/g);
                        var xPosition = parseInt(n[n.length - 1].substring(0, n[n.length - 1].indexOf("_")));
                        var yPosition = parseInt(n[n.length - 1].substring(n[n.length - 1].indexOf("_") + 1));
            
                        //Get image level
                        n = source.match (/_files\/[0-9]+\//g);
                        var imageLevel = parseInt(n[0].substring(7, n[0].length - 1));
                        var levelHeight = Math.ceil(completeImageHeight / Math.pow(2, this._controller.GetMaxLevel(this.facetItem.Img) - imageLevel));
            
                        //Image will need to be scaled to get the displayHeight
                        var scale = displayHeight / levelHeight;
                    
                        // handle overlap 
                        overlap = this._controller.GetOverlap(this.facetItem.Img);
            
                        var offsetx = (Math.floor(blankWidth/2)) + 4 + xPosition * Math.floor((tileSize - overlap)  * scale);
                        var offsety = 4 + Math.floor((yPosition * (tileSize - overlap)  * scale));
            
                        var imageTileHeight = Math.ceil(this._images[i].height * scale);
                        var imageTileWidth = Math.ceil(this._images[i].width * scale);
            
                        // Creates a grid artfact across the image so comment out for now
                        //only clearing a small portion of the canvas
                        //this.context.fillRect(offsetx + this.x, offsety + this.y, imageTileWidth, imageTileHeight);
                        this.context.drawImage(this._images[i], offsetx + this._locations[loc].x , offsety + this._locations[loc].y, imageTileWidth, imageTileHeight);
                    }
                } else {
                    var offsetx = (Math.floor(blankWidth/2)) + 4;
                    var offsety = 4;
                    this.context.drawImage(this._images[0], offsetx + this._locations[loc].x , offsety + this._locations[loc].y, displayWidth, displayHeight);
                }
                
                if (this._selected) {
                    //draw a blue border
                    this.context.beginPath();
                    var offsetx = (Math.floor(blankWidth/2)) + 4;
                    var offsety = 4;
                    this.context.rect(offsetx + this._locations[this.selectedLoc].x , offsety + this._locations[this.selectedLoc].y, displayWidth, displayHeight);
                    this.context.lineWidth = 4;
                    this.context.strokeStyle = "#92C4E1";
                    this.context.stroke();
                }
            }
        }
        else {
            this.DrawEmpty(loc);
        }
    },
    //http://simonsarris.com/blog/510-making-html5-canvas-useful
    Contains: function (mx, my) {
        var foundIt = false;
        var loc = -1;
        for ( i = 0; i < this._locations.length; i++) {
            foundIt = (this._locations[i].x <= mx) && (this._locations[i].x + this.width >= mx) &&
        (this._locations[i].y <= my) && (this._locations[i].y + this.height >= my);
            if (foundIt)
              loc = i;
        }
        return loc;
    },
    DrawEmpty: function (loc) {
        if (this._controller.DrawLevel == undefined) {
            //draw an empty square
            this.context.beginPath();
            this.context.fillStyle = "#D7DDDD";
            this.context.fillRect(this._locations[loc].x + 4, this._locations[loc].y + 4, this.width - 8, this.height - 8);
            this.context.rect(this._locations[loc].x + 4, this._locations[loc].y + 4, this.width - 8, this.height - 8);
            this.context.lineWidth = 1;
            this.context.strokeStyle = "white";
            this.context.stroke();
        } else {
            //use the controllers blank tile
            this._controller.DrawLevel(this.facetItem, this.context, this._locations[loc].x + 4, this._locations[loc].y + 4, this.width - 8, this.height - 8);
        }
    },
    CollectionRoot: "",
    now: null,
    end: null,
    width: 0,
    height: 0,
    origwidth: 0,
    origheight: 0,
    ratio: 1,
    startwidth: 0,
    startheight: 0,
    destinationwidth: 0,
    destinationheight: 0,
    destinationVisible: true,
    context: null,
    facetItem: null,
    firstFilterItemDone: false,
    selectedLoc: 0,
    Selected: function (selected) { this._selected = selected }
});
///
/// Tile Location
/// Used to contain the location of a tile as in the graph view a tile can appear multiple times
///
PivotViewer.Views.TileLocation = Object.subClass({
    init: function () {
    },
    x: 0,
    y: 0,
    startx: 0,
    starty: 0,
    destinationx: 0,
    destinationy: 0,
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///
/// Deep Zoom Image Getter
/// Retrieves and caches images
///
PivotViewer.Views.DeepZoomImageController = PivotViewer.Views.IImageController.subClass({
    init: function () {
        this._items = [];
        this._collageItems = [];
        this._baseUrl = "";
        this._collageMaxLevel = 0;
        this._tileSize = 256;
        this._format = "";
        this._ratio = 1;
        this.MaxRatio = 1;

        this._zooming = false;
        var that = this;

        //Events
        $.subscribe("/PivotViewer/ImageController/Zoom", function (evt) {
            that._zooming = evt;
        });
    },
    Setup: function (deepzoomCollection) {
        //get base URL
        this._baseUrl = deepzoomCollection.substring(0, deepzoomCollection.lastIndexOf("/"));
        this._collageUrl = deepzoomCollection.substring(deepzoomCollection.lastIndexOf("/") + 1).replace('.xml', '_files');
        var that = this;
        //load dzi and start creating array of id's and DeepZoomLevels
        $.ajax({
            type: "GET",
            url: deepzoomCollection,
	    crossDomain: true,
            dataType: "xml",
	    
            success: function (xml) {
                var collection = $(xml).find("Collection");
                that._tileSize = $(collection).attr("TileSize");
                that._format = $(collection).attr('Format');
                that._collageMaxLevel = $(collection).attr('MaxLevel');

                var items = $(xml).find("I");
                if (items.length == 0) {
                    $('.pv-loading').remove();

                    //Throw an alert so the user knows something is wrong
                    var msg = '';
                    msg = msg + 'No items in the DeepZoom Collection<br><br>';
                    msg = msg + 'URL        : ' + this.url + '<br>';
                    msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
                    $('.pv-wrapper').append("<div id=\"pv-dzloading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                    var t=setTimeout(function(){window.open("#pv-dzloading-error","_self")},1000)
                    return;
                }
                
                //If collection itself contains size information, use first one for now
                var dzcSize = $(items[0]).find('Size');
                if (dzcSize.length > 0) {
                    //calculate max level
                    that.MaxWidth = parseInt(dzcSize.attr("Width"));
                    // Use height of first image for now...
                    that.Height = parseInt(dzcSize.attr("Height"));
                    that.MaxRatio = that.Height/that.MaxWidth;

                    for ( i = 0; i < items.length; i++ ) {
                        itemSize = $(items[i]).find("Size");
                        var width = parseInt(itemSize.attr("Width"));
                        var height = parseInt(itemSize.attr("Height"));
                        var maxDim = width > height ? width : height;
                        var maxLevel = Math.ceil(Math.log(maxDim) / Math.log(2));

                        that._ratio = height / width;
                        var dziSource = $(items[i]).attr('Source');
                        var itemId = $(items[i]).attr('Id');
                        var dzN = $(items[i]).attr('N');
                        var dzId = dziSource.substring(dziSource.lastIndexOf("/") + 1).replace(/\.xml/gi, "").replace(/\.dzi/gi, "");
                        var basePath = dziSource.substring(0, dziSource.lastIndexOf("/"));
                        if (basePath.length > 0)
                             basePath = basePath + '/';
                        if (width > that.MaxWidth)
                            that.MaxWidth = width;
                        if (that._ratio < that.MaxRatio)  // i.e. biggest width cf height upside down....
                            that.MaxRatio = that._ratio;

                        that._items.push(new PivotViewer.Views.DeepZoomItem(itemId, dzId, dzN, basePath, that._ratio, width, height, maxLevel, that._baseUrl, dziSource));
                    }
                }

                
                 //Loaded DeepZoom collection
                 $.publish("/PivotViewer/ImageController/Collection/Loaded", null);
             },
             error: function(jqXHR, textStatus, errorThrown) {
                //Make sure throbber is removed else everyone thinks the app is still running
                $('.pv-loading').remove();

		var state = {
			endpoint:	this.url,
			httpCode:	jqXHR.status,
			status:		jqXHR.statusText,
			message:	errorThrown,
			response:	jqXHR.responseText,
		}

		var p = document.createElement('a');
		p.href = this.url;

		state.endpoint = p.protocol + '//' + p.host + p.pathname;

		if (state.status === 'timeout') {
		  state.message = "Timeout loading collection document";
		} else if (state.status === 'error') {
		  if (this.crossDomain && (p.hostname !== window.location.hostname)) {
		    state.message = "Possible issue with CORS settings on the endpoint"
		  }
		} 

                //Display a message so the user knows something is wrong
                var msg = '';
                msg = msg + 'Error loading DeepZoom Cache:<br><br><table>';
		msg = msg + '<colgroup><col style="white-space:nowrap;"><col></colgroup>';
                msg = msg + '<tr><td>Endpoint</td><td>' + state.endpoint + '</td></tr>';
                msg = msg + '<tr><td>Status</td><td>' + state.httpCode + '</td></tr>';
                msg = msg + '<tr><td>Error</td><td> ' + state.message  + '</td></tr>';
                msg = msg + '<tr><td style="vertical-align:top">Details</td><td>' + state.response + '</td></tr>';
                msg = msg + '</table><br>Pivot Viewer cannot continue until this problem is resolved<br>';
                $('.pv-wrapper').append("<div id=\"pv-loading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                var t=setTimeout(function(){window.open("#pv-loading-error","_self")},1000);
            }
        });
    },

    GetImages: function (id, width, height) {
        //Determine level
        var biggest = width > height ? width : height;
        var thisLevel = Math.ceil(Math.log(biggest) / Math.log(2));

        if (thisLevel == Infinity || thisLevel == -Infinity)
            thisLevel = 0;

        //TODO: Look at caching last image to avoid using _controller
        this._level = thisLevel;
        return this.GetImagesAtLevel(id, thisLevel);
    },

    GetImagesAtLevel: function (id, level) {
        //if the request level is greater than the collections max then set to max
        //level = (level > _maxLevel ? _maxLevel : level);

        //For PoC max level is 8
        //level = (level > 8 ? 8 : level);
        level = (level <= 0 ? 6 : level);

        //find imageId
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
                level = (level > this._items[i].MaxLevel ? this._items[i].MaxLevel : level);

                //to work out collage image
                //convert image n to base 2
                //convert to array and put even and odd bits into a string
                //convert strings to base 10 - this represents the tile row and col
                var baseTwo = this._items[i].DZN.toString(2);
                var even = "", odd = "";
                for (var b = 0; b < baseTwo.length; b++) {
                    if (b % 2 == 0)
                        even += baseTwo[b];
                    else
                        odd += baseTwo[b];
                }
                dzCol = parseInt(even, 2);
                dzRow = parseInt(odd, 2);
                //for the zoom level work out the DZ tile where it came from

                if ((this._items[i].Levels == undefined || this._items[i].Levels.length == 0) && !this._zooming) {
                    //create 0 level
                    var imageList = this.GetImageList(i, this._baseUrl + "/" + this._items[i].BasePath + this._items[i].DZId + "_files/6/", 6); ;
                    var newLevel = new PivotViewer.Views.LoadImageSetHelper();
                    newLevel.LoadImages(imageList);
                    this._items[i].Levels.push(newLevel);
                    return null;
                }
                else if (this._items[i].Levels.length < level && !this._zooming) {
                    //requested level does not exist, and the Levels list is smaller than the requested level
                    var imageList = this.GetImageList(i, this._baseUrl + "/" + this._items[i].BasePath + this._items[i].DZId + "_files/" + level + "/", level);
                    var newLevel = new PivotViewer.Views.LoadImageSetHelper();
                    newLevel.LoadImages(imageList);
                    this._items[i].Levels.splice(level, 0, newLevel);
                }

                //get best loaded level to return
                for (var j = level; j > -1; j--) {
                    if (this._items[i].Levels[j] != undefined && this._items[i].Levels[j].IsLoaded()) {
                        return this._items[i].Levels[j].GetImages();
                    }
                    //if request level has not been requested yet
                    if (j == level && this._items[i].Levels[j] == undefined && !this._zooming) {
                        //create array of images to getagePath.replace('.dzi', '').replace('\/\/', '\/');
                        var imageList = this.GetImageList(i, this._baseUrl + "/" + this._items[i].BasePath + this._items[i].DZId + "_files/" + j + "/", j);
                        //create level
                        var newLevel = new PivotViewer.Views.LoadImageSetHelper();
                        newLevel.LoadImages(imageList);
                        this._items[i].Levels.splice(j, 0, newLevel);
                    }
                }

                return null;
            }
        }
        return null;
    },

    GetImageList: function (itemIndex, basePath, level) {
        var fileNames = [];

        var tileSize = this._tileSize;
        var tileFormat = this._format;
        var ratio = this._items[itemIndex].Ratio;
        var height = this._items[itemIndex].Height;
        var maxLevel = this._items[itemIndex].MaxLevel;

        var levelWidth = Math.ceil( (height/ratio) / Math.pow(2, maxLevel - level));
        var levelHeight = Math.ceil(height / Math.pow(2, maxLevel - level));
        //based on the width for this level, get the slices based on the DZ Tile Size
        var hslices = Math.ceil(levelWidth / tileSize);
        var vslices = Math.ceil(levelHeight / tileSize);

        //Construct list of file names based on number of vertical and horizontal images
        for (var i = 0; i < hslices; i++) {
            for (var j = 0; j < vslices; j++) {
                fileNames.push(basePath + i + "_" + j + "." + tileFormat);
            }
        }
        return fileNames;
    },

    GetWidthForImage: function( id, height ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
               return Math.floor(height / this._items[i].Ratio);
            }
        }
    },

    GetDzi: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
               dziName = this._baseUrl + "/" + this._items[i].BasePath + this._items[i].DZId + ".dzi";
               return dziName;
            }
        }
    },

    GetMaxLevel: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
               return this._items[i].MaxLevel;
            }
        }
    },

    GetWidth: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
               return this._items[i].Width;
            }
        }
    },

    GetHeight: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
               return this._items[i].Height;
            }
        }
    },
    GetOverlap: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
               return this._items[i].Overlap;
            }
        }
    },
    GetRatio: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ItemId == id) {
               return this._items[i].Ratio;
            }
        }
    }
});

PivotViewer.Views.DeepZoomItem = Object.subClass({    init: function (ItemId, DZId, DZn, BasePath, Ratio, Width, Height, MaxLevel, baseUrl, dziSource) {
        this.ItemId = ItemId,
        this.DZId = DZId,
        this.DZN = parseInt(DZn),
        this.BasePath = BasePath,
        this.Levels = [];    //jch                    
        this.Ratio = Ratio;  
        this.Width = Width;
        this.Height = Height;
        this.MaxLevel = MaxLevel;
        var that = this;
        //this.Overlap = Overlap;
        // get overlap info from dzi
        $.ajax({
            type: "GET",
            url: baseUrl + "/" + dziSource,
            dataType: "xml",
            success: function (dzixml) {
                //In case we find a dzi, recalculate sizes
                var image = $(dzixml).find("Image");
                if (image.length == 0)
                    return;
        
                var jImage = $(image[0]);
                that.Overlap = jImage.attr('Overlap');
            },
            complete: function(jqXHR, textStatus) {
                //that._items.push(new PivotViewer.Views.DeepZoomItem(itemId, dzId, dzN, basePath, that._ratio, width, height, maxLevel, that._overlap));
            },
            error: function(jqXHR, textStatus, errorThrown) {
                that.Overlap = 0;
            }
        });
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///
/// Deep Zoom Image Getter
/// Retrieves and caches images
///
PivotViewer.Views.SimpleImageController = PivotViewer.Views.IImageController.subClass({
    init: function () {

        this._items = [];
        this._collageItems = [];
        this._baseUrl = "";
        this._collageMaxLevel = 0;
        this._tileSize = 256;
        this._format = "";
        this._ratio = 1;
        this.MaxRatio = 1;
        this._loadedCount = 0;

        this._zooming = false;
        var that = this;

        //Events
        $.subscribe("/PivotViewer/ImageController/Zoom", function (evt) {
            that._zooming = evt;
        });
    },
    Setup: function (baseUrl) {
        //get base URL
        this._baseUrl = baseUrl;
        var that = this;

        // get list of image files
        $.getJSON(baseUrl + "/imagelist.json")
        .done (function (images) {
            // for each item in the collection get the image filename
            for (var i = 0; i < images.ImageFiles.length; i++) {
                var img = new Image(); 

                img.onload = function() {
                    for (var i = 0; i < that._items.length; i++) {
                        if (that._items[i].Images[0] == this) {
                            that._items[i].Width = this.width;
                            that._items[i].Height = this.height;
                            that._loadedCount ++;
                        }
                        if (that._loadedCount == that._items.length) 
                            $.publish("/PivotViewer/ImageController/Collection/Loaded", null);
                        }
                    };

                img.src = that._baseUrl + "/" + images.ImageFiles[i];
                that._items.push(new PivotViewer.Views.SimpleImageItem(images.ImageFiles[i], that._baseUrl, img.width, img.height, img));
           }
        })
        .fail (function (jqxhr, textStatus, errorThrown) {
            //Make sure throbber is removed else everyone thinks the app is still running
            $('.pv-loading').remove();

            //Throw an alert so the user knows something is wrong
            var msg = '';
            msg = msg + 'Error loading image files<br><br>';
            msg = msg + 'URL        : ' + this.url + '<br>';
            msg = msg + 'Status : ' + jqXHR.status + ' ' + errorThrown + '<br>';
            msg = msg + 'Details    : ' + jqXHR.responseText + '<br>';
            msg = msg + '<br>Pivot Viewer cannot continue until this problem is resolved<br>';
            $('.pv-wrapper').append("<div id=\"pv-imageloading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
            var t=setTimeout(function(){window.open("#pv-imageloading-error","_self")},1000)
        });
    },

    // Simple images just ignore the level - same image is used whatever the zoom
    GetImages: function (id, width, height) {
      // Only return image if size is big enough 
      if (width > 8 && height > 8) {
        for (var i = 0;  this._items.length; i++){
          if (this._items[i].ImageId == id) {
            return this._items[i].Images; 
          }
        }
      }
      return null;
    },
    GetWidthForImage: function( id, height ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ImageId == id) {
               return Math.floor(height / (this._items[i].Height/this._items[i].Width));
            }
        }
    },
    GetWidth: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ImageId == id) {
               return this._items[i].Width;
            }
        }
    },
    GetHeight: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ImageId == id) {
               return this._items[i].Height;
            }
        }
    },
    GetRatio: function( id ) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].ImageId == id) {
               return this._items[i].Height/this._items[i].Width;
            }
        }
    }
});

PivotViewer.Views.SimpleImageItem = Object.subClass({
    init: function (ImageId, BasePath, width, height, img) {
        this.ImageId = ImageId,
        this.BasePath = BasePath,
        this.Images = [img];
        this.Width = width;
        this.Height = height;
    }
});
//
//  HTML5 PivotViewer
//
//  Collection loader interface - used so that different types of data sources can be used
//
//  Original Code:
//    Copyright (C) 2011 LobsterPot Solutions - http://www.lobsterpot.com.au/
//    enquiries@lobsterpot.com.au
//
//  Enhancements:
//    Copyright (C) 2012-2021 OpenLink Software - http://www.openlinksw.com/
//
//  This software is licensed under the terms of the
//  GNU General Public License v2 (see COPYING)
//

///PivotViewer jQuery extension
(function ($) {
    var _views = [],
        _facetItemTotals = [], //used to store the counts of all the string facets - used when resetting the filters
        _facetNumericItemTotals = [], //used to store the counts of all the numeric facets - used when resetting the filters
        _facetDateTimeItemTotals = [], //used to store the counts of all the datetime facets - used when resetting the filters
        _wordWheelItems = [], //used for quick access to search values
	_stringFacets = [],
	_numericFacets = [],
	_datetimeFacets = [],
        _currentView = 0,
        _loadingInterval,
        _tileController,
        _tiles = [],
        _filterItems = [],
        _selectedItem = "",
        _selectedItemBkt = 0,
        _initSelectedItem = "",
        _initTableFacet = "",
        _initMapCentreX = "",
        _initMapCentreY = "",
        _initMapType = "",
        _initMapZoom = "",
        _initTimelineFacet = "",
        _handledInitSettings = false,
        _changeToTileViewSelectedItem = "",
        _currentSort = "",
        _imageController,
        _mouseDrag = null,
        _mouseMove = null,
        _viewerState = { View: null, Facet: null, Filters: [] },
        _self = null,
        _nameMapping = {},
        _googleAPILoaded = false,
        _googleAPIKey,
        _mapService = "OpenStreetMap",
        _geocodeService = "Nominatim",
        _overlayBaseUrl = "",
        PivotCollection = new PivotViewer.Models.Collection();

    var methods = {
        // PivotViewer can be initialised with these options:
        // Loader: a loader that inherits from ICollectionLoader must be specified.  Currently the project only includes the CXMLLoader.  It takes the URL of the collection as a parameter.
        // ImageController: defaults to the DeepZoom image controller.
        // ViewerState: Sets the filters, selected item and chosen view when the PivotViewer first opens
        // MapService: which map service to use.  This can be either Google or OpenStreetMap. 
        // GeocodeService: which geocode service to use.  This can either be Google or Nominatim. 
        // GoogleAPIKey: required to use the Google map or geocode service. 
        // MapOverlay: option to add a WMS overlay to the map.  The base url of the WMS server should be
        //   supplied without the bbox option e.g.
        //     MapOverlay: http://maps.communities.gov.uk:8080/geoserver/eafloodareas/wms?service=WMS&version=1.1.0&request=GetMap&layers=FloodAlertsWarnings&styles=&srs=EPSG:4326&format=image%2Fjpeg
 
        init: function (options) {
            _self = this;
            _self.empty();
            _self.addClass('pv-wrapper');
            InitPreloader();

            //Load default options from "defaults" file
            $.getJSON("defaults")
            .always( function (defaultOptions) {

                //Options Map Service
                if (options.MapService == "Google" && options.GoogleAPIKey != undefined) {
                   _googleAPIKey = options.GoogleAPIKey;
                   _mapService = "Google";
                } else if (options.MapService == "Google" && defaultOptions.GoogleAPIKey != undefined) {
                   _googleAPIKey = defaultOptions.GoogleAPIKey;
                   _mapService = "Google";
                } else if (options.MapService == undefined && defaultOptions.MapService == "Google" && options.GoogleAPIKey != undefined) {
                   _googleAPIKey = options.GoogleAPIKey;
                   _mapService = "Google";
                } else if (options.MapService == undefined && defaultOptions.MapService == "Google" && defaultOptions.GoogleAPIKey != undefined) {
                   _googleAPIKey = defaultOptions.GoogleAPIKey;
                   _mapService = "Google";
                } else if (options.MapService == "Google" && options.GoogleAPIKey == undefined && defaultOptions.GoogleAPIKey == undefined) {
                   _mapService = "OpenStreetMap";
                   PivotViewer.Debug.Log('Google maps selected but no API key supplied.  Reverting to OpenStreetMaps');
                } else if (options.MapService == undefined && defaultOptions.MapService == "Google" && options.GoogleAPIKey == undefined && defaultOptions.GoogleAPIKey == undefined) {
                   _mapService = "OpenStreetMap";
                   PivotViewer.Debug.Log('Google maps selected but no API key supplied.  Reverting to OpenStreetMaps');
                } else
                   _mapService = "OpenStreetMap";
 
                if ( _mapService == "Google") {
                    // Load the google maps plugin for wicket
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = "scripts/wicket-gmap3.min.js";
                    document.body.appendChild(script);
                } else {
                    // Load the leaflets plugin for wicket
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = "scripts/wicket-leaflet.min.js";
                    document.body.appendChild(script);
                }
 
                //Options Geocode Service
                if (options.GeocodeService == "Google" && options.GoogleAPIKey != undefined) {
                   _googleAPIKey = options.GoogleAPIKey;
                   _geocodeService = "Google";
                } else if (options.GeocodeService == "Google" && defaultOptions.GoogleAPIKey != undefined) {
                   _googleAPIKey = defaultOptions.GoogleAPIKey;
                   _geocodeService = "Google";
                } else if (options.GeocodeService == undefined && defaultOptions.GeocodeService == "Google" && options.GoogleAPIKey != undefined) {
                   _googleAPIKey = options.GoogleAPIKey;
                   _geocodeService = "Google";
                } else if (options.GeocodeService == undefined && defaultOptions.GeocodeService == "Google" && defaultOptions.GoogleAPIKey != undefined) {
                   _googleAPIKey = defaultOptions.GoogleAPIKey;
                   _geocodeService = "Google";
                } else if (options.GeocodeService == "Google" && options.GoogleAPIKey == undefined && defaultOptions.GoogleAPIKey == undefined) {
                   _geocodeService = "Nominatim";
                   PivotViewer.Debug.Log('Google geocode service selected but no API key supplied.  Reverting to Nominatim');
                } else if (options.GeocodeService == undefined && defaultOptions.GeocodeService == "Google" && options.GoogleAPIKey == undefined && defaultOptions.GoogleAPIKey == undefined) {
                   _geocodeService = "Nominatim";
                   PivotViewer.Debug.Log('Google geocode service selected but no API key supplied.  Reverting to Nominatim');
                } else
                   _geocodeService == "Nominatim";
 
                //Options map overlay
                if (options.MapOverlay != undefined)
                  _overlayBaseUrl = options.MapOverlay;
                else if (defaultOptions.MapOverlay != undefined)
                  _overlayBaseUrl = defaultOptions.MapOverlay;
 
                //ViewerState
                //http://i2.silverlight.net/content/pivotviewer/developer-info/api/html/P_System_Windows_Pivot_PivotViewer_ViewerState.htm
                if (options.ViewerState != undefined || defaultOptions.ViewerState != undefined) {
                    var splitVS;

                    if (options.ViewerState != undefined)
                        splitVS = options.ViewerState.split('&');
                    else
                        splitVS = defaultOptions.ViewerState.split('&');

                    for (var i = 0, _iLen = splitVS.length; i < _iLen; i++) {
                        var splitItem = splitVS[i].split('=');
                        if (splitItem.length == 2) {
                            //Selected view
                            if (splitItem[0] == '$view$')
                                _viewerState.View = parseInt(splitItem[1]) - 1;
                            //Sorted by
                            else if (splitItem[0] == '$facet0$')
                                _viewerState.Facet = PivotViewer.Utils.EscapeItemId(splitItem[1]);
                            //Selected Item
                            else if (splitItem[0] == '$selection$')
                                _viewerState.Selection = PivotViewer.Utils.EscapeItemId(splitItem[1]);
                            //Table Selected Facet
                            else if (splitItem[0] == '$tableFacet$')
                                _viewerState.TableFacet = PivotViewer.Utils.EscapeItemId(splitItem[1]);
                            //Map Centre X
                            else if (splitItem[0] == '$mapCentreX$')
                                _viewerState.MapCentreX = splitItem[1];
                            //Map Centre Y
                            else if (splitItem[0] == '$mapCentreY$')
                                _viewerState.MapCentreY = splitItem[1];
                            //Map Type
                            else if (splitItem[0] == '$mapType$')
                                _viewerState.MapType = PivotViewer.Utils.EscapeItemId(splitItem[1]);
                            //Map Zoom
                            else if (splitItem[0] == '$mapZoom$')
                                _viewerState.MapZoom = PivotViewer.Utils.EscapeItemId(splitItem[1]);
                            //Timeline Selected Facet
                            else if (splitItem[0] == '$timelineFacet$')
                                _viewerState.TimelineFacet = PivotViewer.Utils.EscapeItemId(splitItem[1]);
                            //Filters
                            else {
                                var filter = { Facet: splitItem[0], Predicates: [] };
                                var filters = splitItem[1].split('_');
                                for (var j = 0, _jLen = filters.length; j < _jLen; j++) {
                                    //var pred = filters[j].split('.');
                                    if (filters[j].indexOf('.') > 0) {
                                        var pred = filters[j].substring(0, filters[j].indexOf('.'));
                                        var value = filters[j].substring(filters[j].indexOf('.') + 1);
                                        //if (pred.length == 2)
                                        filter.Predicates.push({ Operator: pred, Value: value });
                                    }
                                }
                                _viewerState.Filters.push(filter);
                            }
                        }
                    }
                }

                //Collection loader
                try {
                  if (options.Loader == undefined && defaultOptions.Loader == undefined)
                    throw "Collection loader is undefined.";
                  if (options.Loader instanceof PivotViewer.Models.Loaders.ICollectionLoader) 
                      options.Loader.LoadCollection(PivotCollection);
                   else if (defaultOptions.Loader instanceof PivotViewer.Models.Loaders.ICollectionLoader) 
                      defaultOptions.Loader.LoadCollection(PivotCollection);
                   else
                      throw "Collection loader does not inherit from PivotViewer.Models.Loaders.ICollectionLoader.";
                } catch (err) { 
                    var msg = '';
                    msg = msg + err;
                    //Make sure throbber is removed else everyone thinks the app is still running
                    $('.pv-loading').remove();

                    $('.pv-wrapper').append("<div id=\"pv-loading-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                    window.open("#pv-loading-error","_self")
                }
 
                //Image controller
                if (options.ImageController == undefined && defaultOptions.ImageController == undefined)
                    _imageController = new PivotViewer.Views.DeepZoomImageController();
                else if (options.ImageController instanceof PivotViewer.Views.IImageController)
                    _imageController = options.ImageController;
                else if (defaultOptions.ImageController instanceof PivotViewer.Views.IImageController)
                    _imageController = defautlOptions.ImageController;
                else
                    throw "Image Controller does not inherit from PivotViewer.Views.IImageController.";
 
            })
            .fail (function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                PivotViewer.Debug.Log ("Getting defaults file failed: " + err);
            });
        },
        show: function () {
            PivotViewer.Debug.Log('Show');
        },
        hide: function () {
            PivotViewer.Debug.Log('Hide');
        }
    };

    InitPreloader = function () {
        //http://gifmake.com/
        _self.append("<div class='pv-loading'><img src='images/loading.gif' alt='Loading' /><span>Loading...</span></div>");
        $('.pv-loading').css('top', ($('.pv-wrapper').height() / 2) - 33 + 'px');
        $('.pv-loading').css('left', ($('.pv-wrapper').width() / 2) - 43 + 'px');
    };

    InitTileCollection = function () {
        InitUI();
        //init DZ Controller
        var baseCollectionPath = PivotCollection.ImageBase;
        if (!(baseCollectionPath.indexOf('http', 0) >= 0 || baseCollectionPath.indexOf('www.', 0) >= 0))
            baseCollectionPath = PivotCollection.CollectionBase.substring(0, PivotCollection.CollectionBase.lastIndexOf('/') + 1) + baseCollectionPath;
        var canvasContext = $('.pv-viewarea-canvas')[0].getContext("2d");

        //Init Tile Controller and start animation loop
        _tileController = new PivotViewer.Views.TileController(_imageController);
        _tiles = _tileController.initTiles(PivotCollection.Items, baseCollectionPath, canvasContext);
        //Init image controller
        _imageController.Setup(baseCollectionPath.replace("\\", "/"));
    };

    InitPivotViewer = function () {
        CreateFacetList();
        CreateViews();
        AttachEventHandlers();

        //loading completed
        $('.pv-loading').remove();

        //Apply ViewerState filters
        ApplyViewerState();
        _initSelectedItem = GetItem(_viewerState.Selection);
        _initTableFacet = _viewerState.TableFacet;
        _initMapCentreX = _viewerState.MapCentreX;
        _initMapCentreY = _viewerState.MapCentreY;
        _initMapType = _viewerState.MapType;
        _initMapZoom = _viewerState.MapZoom;
        _initTimelineFacet = _viewerState.TimelineFacet;

        //Set the width for displaying breadcrumbs as we now know the control sizes 
        //Hardcoding the value for the width of the viewcontrols images (145=29*5) as the webkit browsers 
        //do not know the size of the images at this point.
        var controlsWidth = $('.pv-toolbarpanel').innerWidth() - ($('.pv-toolbarpanel-brandimage').outerWidth(true) + 25 + $('.pv-toolbarpanel-name').outerWidth(true) + $('.pv-toolbarpanel-zoomcontrols').outerWidth(true) + 145 + $('.pv-toolbarpanel-sortcontrols').outerWidth(true));

        $('.pv-toolbarpanel-facetbreadcrumb').css('width', controlsWidth + 'px');

        //select first view
        if (_viewerState.View != null) {
            if (_viewerState.View != 0 && _viewerState.View  != 1) {
                // Always have to initialize tiles one way or another
                SelectView(0, true);
                // Set handled init back to false
                _handledInitSettings = false;
            }
            SelectView(_viewerState.View, true);
        } else
            SelectView(0, true);

        //Begin tile animation
        var id = (_initSelectedItem && _initSelectedItem.Id) ? _initSelectedItem.Id : "";
        _tileController.BeginAnimation(true, id);

        // If Map view apply initial selection here
        if (_currentView == 3) {  
            if (_initSelectedItem) {
                $.publish("/PivotViewer/Views/Item/Selected", [{id: _initSelectedItem.Id, bkt: 0}]);
                _views[3].RedrawMarkers(_initSelectedItem.Id);
            } else {
                $.publish("/PivotViewer/Views/Item/Selected", [{id: "", bkt: 0}]);
                _views[3].RedrawMarkers("");
            }
        }

    };

    InitUI = function () {
        //toolbar
        var toolbarPanel = "<div class='pv-toolbarpanel'>";

        var brandImage = PivotCollection.BrandImage;
        if (brandImage.length > 0)
            toolbarPanel += "<img class='pv-toolbarpanel-brandimage' src='" + brandImage + "'></img>";
        toolbarPanel += "<span class='pv-toolbarpanel-name'>" + PivotCollection.CollectionName + "</span>";
        toolbarPanel += "<div class='pv-toolbarpanel-facetbreadcrumb'></div>";
        toolbarPanel += "<div class='pv-toolbarpanel-zoomcontrols'><div class='pv-toolbarpanel-zoomslider'></div>";
        toolbarPanel += "<div class='pv-toolbarpanel-timelineselector'></div>";
        toolbarPanel += "<div class='pv-toolbarpanel-maplegend'></div></div>";
        toolbarPanel += "<div class='pv-toolbarpanel-viewcontrols'></div>";
        toolbarPanel += "<div class='pv-toolbarpanel-sortcontrols'></div>";
        toolbarPanel += "</div>";
        _self.append(toolbarPanel);

        //setup zoom slider
        var thatRef = 0;
        $('.pv-toolbarpanel-zoomslider').slider({
            max: 100,
            change: function (event, ui) {
                var val = ui.value - thatRef;
                //Find canvas centre
                centreX = $('.pv-viewarea-canvas').width() / 2;
                centreY = $('.pv-viewarea-canvas').height() / 2;
                $.publish("/PivotViewer/Views/Canvas/Zoom", [{ x: centreX, y: centreY, delta: 0.5 * val}]);
                thatRef = ui.value;
            }
        });

        //main panel
        _self.append("<div class='pv-mainpanel'></div>");
        var mainPanelHeight = $('.pv-wrapper').height() - $('.pv-toolbarpanel').height() - 6;
        $('.pv-mainpanel').css('height', mainPanelHeight + 'px');
        $('.pv-mainpanel').append("<div class='pv-filterpanel'></div>");
        $('.pv-mainpanel').append("<div class='pv-viewpanel'><canvas class='pv-viewarea-canvas' width='" + _self.width() + "' height='" + mainPanelHeight + "px'></canvas></div>");
        $('.pv-mainpanel').append("<div class='pv-infopanel'></div>");
 
        //add grid for tableview to the mainpanel
        $('.pv-viewpanel').append("<div class='pv-tableview-table' id='pv-table'></div>");

        //add canvas for map to the mainpanel
        $('.pv-viewpanel').append("<div class='pv-mapview-canvas' id='pv-map-canvas'></div>");
        //add map legend 
        $('.pv-mainpanel').append("<div class='pv-mapview-legend' id='pv-map-legend'></div>");

        //add canvas for timeline to the mainpanel
        $('.pv-viewpanel').append("<div class='pv-timeview-canvas' id='pv-time-canvas'></div>");

        //filter panel
        var filterPanel = $('.pv-filterpanel');
        filterPanel.append("<div class='pv-filterpanel-clearall'>Clear All</div>")
            .append("<input class='pv-filterpanel-search' type='text' placeholder='Search...' /><div class='pv-filterpanel-search-autocomplete'></div>")
            .css('height', mainPanelHeight - 13 + 'px');
        if (navigator.userAgent.match(/iPad/i) != null)
            $('.pv-filterpanel-search').css('width', filterPanel.width() - 10 + 'px');
        else
            $('.pv-filterpanel-search').css('width', filterPanel.width() - 2 + 'px');
        $('.pv-filterpanel-search-autocomplete')
            .css('width', filterPanel.width() - 8 + 'px')
            .hide();
        //view panel
        //$('.pv-viewpanel').css('left', $('.pv-filterpanel').width() + 28 + 'px');
        //info panel
        var infoPanel = $('.pv-infopanel');
        infoPanel.css('left', (($('.pv-mainpanel').offset().left + $('.pv-mainpanel').width()) - 205) + 'px')
            .css('height', mainPanelHeight - 28 + 'px');
        infoPanel.append("<div class='pv-infopanel-controls'></div>");
        $('.pv-infopanel-controls').append("<div><div class='pv-infopanel-controls-navleft'></div><div class='pv-infopanel-controls-navleftdisabled'></div><div class='pv-infopanel-controls-navbar'></div><div class='pv-infopanel-controls-navright'></div><div class='pv-infopanel-controls-navrightdisabled'></div></div>");
        $('.pv-infopanel-controls-navleftdisabled').hide();
        $('.pv-infopanel-controls-navrightdisabled').hide();
        infoPanel.append("<div class='pv-infopanel-heading'></div>");
        infoPanel.append("<div class='pv-infopanel-details'></div>");
        if (PivotCollection.MaxRelatedLinks > 0) {
            infoPanel.append("<div class='pv-infopanel-related'></div>");
        }
        if (PivotCollection.CopyrightName != "") {
            infoPanel.append("<div class='pv-infopanel-copyright'><a href=\"" + PivotCollection.CopyrightHref + "\" target=\"_blank\">" + PivotCollection.CopyrightName + "</a></div>");
        }
        infoPanel.hide();
        //position the map legend panel
        $('.pv-mapview-legend').css('left', (($('.pv-mainpanel').offset().left + $('.pv-mainpanel').width()) - 205) + 'px')
            .css('height', mainPanelHeight - 28 + 'px');
    };

    //Creates facet list for the filter panel
    //Adds the facets into the filter select list
    CreateFacetList = function () {
        //build list of all facets - used to get id references of all facet items and store the counts
        for (var i = 0; i < PivotCollection.Items.length; i++) {
            var currentItem = PivotCollection.Items[i];

            //Go through Facet Categories to get properties
            for (var m = 0; m < PivotCollection.FacetCategories.length; m++) {
                var currentFacetCategory = PivotCollection.FacetCategories[m];

                //Add to the facet panel
                var hasValue = false;

                //Get values                    
                for (var j = 0, _jLen = currentItem.Facets.length; j < _jLen; j++) {
                    var currentItemFacet = currentItem.Facets[j];
                    //If the facet is found then add it's values to the list
                    if (currentItemFacet.Name == currentFacetCategory.Name) {
                        for (var k = 0; k < currentItemFacet.FacetValues.length; k++) {
                            if (currentFacetCategory.Type == PivotViewer.Models.FacetType.String ||
                                currentFacetCategory.Type == PivotViewer.Models.FacetType.Link) {
                                var found = false;
                                var itemId = "pv-facet-item-" + CleanName(currentItemFacet.Name) + "__" + CleanName(currentItemFacet.FacetValues[k].Value);
                                for (var n = _facetItemTotals.length - 1; n > -1; n -= 1) {
                                    if (_facetItemTotals[n].itemId == itemId) {
                                        _facetItemTotals[n].count += 1;
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found)
                                    _facetItemTotals.push({ itemId: itemId, itemValue: currentItemFacet.FacetValues[k].Value, facet: currentItemFacet.Name, count: 1 });
                            }
                            else if (currentFacetCategory.Type == PivotViewer.Models.FacetType.Number) {
                                //collect all the numbers to update the histogram
                                var numFound = false;
                                for (var n = 0; n < _facetNumericItemTotals.length; n++) {
                                    if (_facetNumericItemTotals[n].Facet == currentItem.Facets[j].Name) {
                                        _facetNumericItemTotals[n].Values.push(currentItemFacet.FacetValues[k].Value);
                                        numFound = true;
                                        break;
                                    }
                                }
                                if (!numFound)
                                    _facetNumericItemTotals.push({ Facet: currentItemFacet.Name, Values: [currentItemFacet.FacetValues[k].Value] });
                            }
                        }
                        hasValue = true;
                    }
                }

                if (!hasValue) {
                    //Create (no info) value
                    var found = false;
                    var itemId = "pv-facet-item-" + CleanName(currentFacetCategory.Name) + "__" + CleanName("(no info)");
                    for (var n = _facetItemTotals.length - 1; n > -1; n -= 1) {
                        if (_facetItemTotals[n].itemId == itemId) {
                            _facetItemTotals[n].count += 1;
                            found = true;
                            break;
                        }
                    }

                    if (!found)
                        _facetItemTotals.push({ itemId: itemId, itemValue: "(no info)", facet: currentFacetCategory.Name, count: 1 });
                }

                //Add to the word wheel cache array
                if (currentFacetCategory.IsWordWheelVisible) {
                    //Get values                    
                    for (var j = 0, _jLen = currentItem.Facets.length; j < _jLen; j++) {
                        var currentItemFacet = currentItem.Facets[j];
                        //If the facet is found then add it's values to the list
                        if (currentItemFacet.Name == currentFacetCategory.Name) {
                            for (var k = 0; k < currentItemFacet.FacetValues.length; k++) {
                                if (currentFacetCategory.Type == PivotViewer.Models.FacetType.String) {
                                    _wordWheelItems.push({ Facet: currentItemFacet.Name, Value: currentItemFacet.FacetValues[k].Value });
                                }
                            }
                        }
                    }
                }
            }
        }

        CreateDatetimeBuckets();

        var facets = ["<div class='pv-filterpanel-accordion'>"];
        var sort = [];
        var activeNumber = 0;
        for (var i = 0; i < PivotCollection.FacetCategories.length; i++) {
            var controlVisibility = 'inherit';
            if (!PivotCollection.FacetCategories[i].IsFilterVisible) 
                controlVisibility = 'none';

            if (i == activeNumber && controlVisibility == 'none')
              activeNumber++;

            facets[i + 1] = "<h3 style='display:" + controlVisibility + "'><a href='#' title=" + PivotViewer.Utils.StripVirtcxml(PivotCollection.FacetCategories[i].Name) + ">";
            facets[i + 1] += PivotViewer.Utils.StripVirtcxml(PivotCollection.FacetCategories[i].Name);
            facets[i + 1] += "</a><div class='pv-filterpanel-accordion-heading-clear' facetType='" + PivotCollection.FacetCategories[i].Type + "'>&nbsp;</div></h3>";
            facets[i + 1] += "<div style='display:" + controlVisibility + "' style='height:30%' id='pv-cat-" + CleanName(PivotCollection.FacetCategories[i].Name) + "'>";

            //Create facet controls
            if (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.DateTime ) {
                if (PivotCollection.FacetCategories[i].decadeBuckets.length > 1) {
                    // Show decades and years 
                    facets[i + 1] += CreateBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].decadeBuckets, PivotCollection.FacetCategories[i].yearBuckets);
                    // Create hidden controls for months, days etc.
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].monthBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].dayBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].hourBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].minuteBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].secondBuckets);
                } else if (PivotCollection.FacetCategories[i].yearBuckets.length > 1) {
                    // Show years and months
                    facets[i + 1] += CreateBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].yearBuckets, PivotCollection.FacetCategories[i].monthBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].decadeBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].dayBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].hourBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].minuteBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].secondBuckets);
                } else if (PivotCollection.FacetCategories[i].monthBuckets.length > 1) {
                    // Show months and days
                    facets[i + 1] += CreateBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].monthBuckets, PivotCollection.FacetCategories[i].dayBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].decadeBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].yearBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].hourBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].minuteBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].secondBuckets);
                } else if (PivotCollection.FacetCategories[i].dayBuckets.length > 1) {
                    // Show days and hours
                    facets[i + 1] += CreateBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].dayBuckets, PivotCollection.FacetCategories[i].hourBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].decadeBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].yearBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].monthBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].minuteBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].secondBuckets);
                } else if (PivotCollection.FacetCategories[i].hourBuckets.length > 1) {
                    // Show hours and minutes
                    facets[i + 1] += CreateBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].hourBuckets, PivotCollection.FacetCategories[i].minuteBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].decadeBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].yearBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].monthBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].dayBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].secondBuckets);
                } else if (PivotCollection.FacetCategories[i].minuteBuckets.length > 1) {
                    // Show minutes and seconds
                    facets[i + 1] += CreateBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].minuteBuckets, PivotCollection.FacetCategories[i].secondBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].decadeBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].yearBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].monthBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].dayBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].hourBuckets);
                } else if (PivotCollection.FacetCategories[i].secondBuckets.length > 1) {
                    // Show seconds
                    facets[i + 1] += CreateBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].secondBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].decadeBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].yearBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].monthBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].dayBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].hourBuckets);
                    facets[i + 1] += CreateHiddenBucketizedDateTimeFacets(PivotCollection.FacetCategories[i].Name, PivotCollection.FacetCategories[i].minuteBuckets);
                }
                facets[i + 1] += CreateDatetimeNoInfoFacet(PivotCollection.FacetCategories[i].Name);
                facets[i + 1] += CreateCustomRange(PivotCollection.FacetCategories[i].Name);
    	}
            else if (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.String ||
                     PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.Link) {
                //Sort
                if (PivotCollection.FacetCategories[i].CustomSort != undefined || PivotCollection.FacetCategories[i].CustomSort != null)
                    facets[i + 1] += "<span class='pv-filterpanel-accordion-facet-sort' customSort='" + PivotCollection.FacetCategories[i].CustomSort.Name + "'>Sort: " + PivotCollection.FacetCategories[i].CustomSort.Name + "</span>";
                else
                    facets[i + 1] += "<span class='pv-filterpanel-accordion-facet-sort'>Sort: A-Z</span>";
                facets[i + 1] += CreateStringFacet(PivotCollection.FacetCategories[i].Name);
            }
            else if (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.Number)
                facets[i + 1] += "<div id='pv-filterpanel-category-numberitem-" + CleanName(PivotCollection.FacetCategories[i].Name) + "'></div>";

            facets[i + 1] += "</div>";
            //Add to sort
            sort[i] = "<option value='" + CleanName(PivotCollection.FacetCategories[i].Name) + "' label='" + PivotViewer.Utils.StripVirtcxml(PivotCollection.FacetCategories[i].Name) + "'>" + PivotViewer.Utils.StripVirtcxml(PivotCollection.FacetCategories[i].Name) + "</option>";
        }
        facets[facets.length] = "</div>";
        $(".pv-filterpanel").append(facets.join(''));
        //Default sorts
        for (var i = 0; i < PivotCollection.FacetCategories.length; i++) {
            if (PivotCollection.FacetCategories[i].IsFilterVisible)
                SortFacetItems(PivotCollection.FacetCategories[i].Name);
        }
	// Minus an extra 25 to leave room for the version number to be added underneath
        $(".pv-filterpanel-accordion").css('height', ($(".pv-filterpanel").height() - $(".pv-filterpanel-search").height() - 75) + "px");
        $(".pv-filterpanel-accordion").accordion({
          icons: false
        });
        $('.pv-toolbarpanel-sortcontrols').append('<select class="pv-toolbarpanel-sort">' + sort.join('') + '</select>');

        // Set the active div in the accordion
        $( ".pv-filterpanel-accordion" ).accordion( "option", "active", activeNumber ); 

        //setup numeric facets
        for (var i = 0; i < _facetNumericItemTotals.length; i++)
            CreateNumberFacet(CleanName(_facetNumericItemTotals[i].Facet), _facetNumericItemTotals[i].Values);
    };

    /// Create the individual controls for the facet
    CreateBucketizedDateTimeFacets = function (facetName, array1, array2) {
        var facetControls = ["<ul class='pv-filterpanel-accordion-facet-list'>"];

        // deal with array1
        if (array1) {
            for (var i = 0; i < array1.length; i++) {
                var index = i + 1;
                facetControls[index] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='pv-facet-item-" + CleanName(facetName) + "__" + CleanName(array1[i].Name.toString()) + "'>";
                facetControls[index] += "<input itemvalue='" + CleanName(array1[i].Name.toString()) + "' itemfacet='" + CleanName(facetName.toString()) + "' class='pv-facet-facetitem' type='checkbox' />"
                facetControls[index] += "<span class='pv-facet-facetitem-label' title='" + array1[i].Name + "'>" +  array1[i].Name + "</span>";
                facetControls[index] += "<span class='pv-facet-facetitem-count'>0</span>"
                facetControls[index] += "</li>";
            }
        }
        facetControls[array1.length + 1] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='pv-facet-item-LineBreak' style='border-bottom:thin solid #E2E2E2;'></li>";
        facetControls[array1.length + 2] = "</ul>";
        facetControls[array1.length + 3] = "<ul class='pv-filterpanel-accordion-facet-list'>";

        // deal with array2
        if (array2) {
            for (var i = 0; i < array2.length; i++) {
                var index = i + 4 + array1.length;
                facetControls[index] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='pv-facet-item-" + CleanName(facetName) + "__" + CleanName(array2[i].Name.toString()) + "'>";
                facetControls[index] += "<input itemvalue='" + CleanName(array2[i].Name.toString()) + "' itemfacet='" + CleanName(facetName.toString()) + "' class='pv-facet-facetitem' type='checkbox' />"
                facetControls[index] += "<span class='pv-facet-facetitem-label' title='" + array2[i].Name + "'>" +  array2[i].Name + "</span>";
                facetControls[index] += "<span class='pv-facet-facetitem-count'>0</span>"
                facetControls[index] += "</li>";
            }
        }
        facetControls[array1.length + array2.length + 4] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='pv-facet-item-LineBreak2' style='border-bottom:thin solid #E2E2E2;'></li>";
        facetControls[array1.length + array2.length + 5] = "</ul>";
        return facetControls.join('');
    };

    CreateHiddenBucketizedDateTimeFacets = function (facetName, array1) {
        var facetControls = ["<ul class='pv-filterpanel-accordion-facet-list' style='visibility:hidden;display:none'>"];

        if (array1) {
            for (var i = 0; i < array1.length; i++) {
                var index = i + 1;
                facetControls[index] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='pv-facet-item-" + CleanName(facetName) + "__" + CleanName(array1[i].Name.toString()) + "' style='visibility:hidden'>";
                facetControls[index] += "<input itemvalue='" + CleanName(array1[i].Name.toString()) + "' itemfacet='" + CleanName(facetName.toString()) + "' class='pv-facet-facetitem' type='checkbox' />"
                facetControls[index] += "<span class='pv-facet-facetitem-label' title='" + array1[i].Name + "'>" +  array1[i].Name + "</span>";
                facetControls[index] += "<span class='pv-facet-facetitem-count'>0</span>"
                facetControls[index] += "</li>";
            }
            facetControls[facetControls.length] = "<li class='pv-filterpanel-accordion-facet-list-item'  style='border-bottom:thin solid #E2E2E2;' style='visibility:hidden'></li>";
            facetControls[facetControls.length] = "</ul>";
        }

        return facetControls.join('');
    };

    CreateCustomRange = function (facetName) {
        var facetControls = ["<ul class='pv-filterpanel-accordion-facet-list'>"];
        facetControls[1] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='pv-facet-item-" + CleanName(facetName) + "__" + "_CustomRange'>";
        facetControls[1] += "<input itemvalue='CustomRange' itemfacet='" + CleanName(facetName) + "' class='pv-facet-facetitem' type='checkbox' />"
        facetControls[1] += "<span class='pv-facet-facetitem-label' title='Custom Range'>Custom Range</span>";
        facetControls[1] += "</li>";
    facetControls[1] += "<ul class='pv-filterpanel-accordion-facet-list'>"
    facetControls[1] += "<li class='pv-filterpanel-accordion-facet-list-item' id='pv-custom-range-" + CleanName(facetName) + "__Start' style='visibility:hidden;float:right'>"
    facetControls[1] += "<span class='pv-facet-customrange-label' title='Start Date' >Start:</span>"
    facetControls[1] += "<input itemvalue='CustomRangeStart' itemfacet='" + CleanName(facetName) + "' id='pv-custom-range-" + CleanName(facetName) + "__StartDate' class='pv-facet-customrange' type='text'/>"
    facetControls[1] += "</li>";
    facetControls[1] += "<li class='pv-filterpanel-accordion-facet-list-item' id='pv-custom-range-" + CleanName(facetName) + "__Finish' style='visibility:hidden;float:right'>"
    facetControls[1] += "<span class='pv-facet-customrange-label' title='End Date'>End:</span>"
    facetControls[1] += "<input itemvalue='CustomRangeFinish' itemfacet='" + CleanName(facetName) + "' id='pv-custom-range-" + CleanName(facetName) + "__FinishDate' class='pv-facet-customrange' type='text'/>"
    facetControls[1] += "</li>";
        facetControls[facetControls.length] = "</ul>";
        return facetControls.join('');
    };

    CreateDatetimeNoInfoFacet = function (facetName) {
        var facetControls = ["<ul class='pv-filterpanel-accordion-facet-list'>"];
        for (var i = 0; i < _facetItemTotals.length; i++) {
            if (_facetItemTotals[i].facet == facetName && _facetItemTotals[i].itemValue == '(no info)') {
                facetControls[1] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='" + _facetItemTotals[i].itemId + "'>";
                facetControls[1] += "<input itemvalue='" + CleanName(_facetItemTotals[i].itemValue) + "' itemfacet='" + CleanName(facetName) + "' class='pv-facet-facetitem' type='checkbox' />"
                facetControls[1] += "<span class='pv-facet-facetitem-label' title='" + _facetItemTotals[i].itemValue + "'>" + _facetItemTotals[i].itemValue + "</span>";
                facetControls[1] += "<span class='pv-facet-facetitem-count'>0</span>"
                facetControls[1] += "</li>";
            }
        }
        facetControls[facetControls.length] = "<li class='pv-filterpanel-accordion-facet-list-item'  style='border-bottom:thin solid #E2E2E2;'></li>";
        facetControls[facetControls.length] = "</ul>";
        return facetControls.join('');
    };

    CreateStringFacet = function (facetName) {
        var facetControls = ["<ul class='pv-filterpanel-accordion-facet-list'>"];
        for (var i = 0; i < _facetItemTotals.length; i++) {
            if (_facetItemTotals[i].facet == facetName) {
                facetControls[i + 1] = "<li class='pv-filterpanel-accordion-facet-list-item'  id='" + _facetItemTotals[i].itemId + "'>";
                facetControls[i + 1] += "<input itemvalue='" + CleanName(_facetItemTotals[i].itemValue) + "' itemfacet='" + CleanName(facetName) + "' class='pv-facet-facetitem' type='checkbox' />"
                facetControls[i + 1] += "<span class='pv-facet-facetitem-label' title='" + _facetItemTotals[i].itemValue + "'>" + _facetItemTotals[i].itemValue + "</span>";
                facetControls[i + 1] += "<span class='pv-facet-facetitem-count'>0</span>"
                facetControls[i + 1] += "</li>";
            }
        }
        facetControls[facetControls.length] = "</ul>";
        return facetControls.join('');
    };

    CreateNumberFacet = function (facetName, facetValues) {
        //histogram dimensions
        var w = 165, h = 80;

        var chartWrapper = $("#pv-filterpanel-category-numberitem-" + PivotViewer.Utils.EscapeMetaChars(facetName));
        chartWrapper.empty();
        chartWrapper.append("<span class='pv-filterpanel-numericslider-range-val'>&nbsp;</span>");
        var chart = "<svg class='pv-filterpanel-accordion-facet-chart' width='" + w + "' height='" + h + "'>";

        //Create histogram
        var histogram = PivotViewer.Utils.Histogram(facetValues);
        //work out column width based on chart width
        var columnWidth = (0.5 + (w / histogram.BinCount)) | 0;
        //get the largest count from the histogram. This is used to scale the heights
        var maxCount = 0;
        for (var k = 0, _kLen = histogram.Histogram.length; k < _kLen; k++)
            maxCount = maxCount < histogram.Histogram[k].length ? histogram.Histogram[k].length : maxCount;
        //draw the bars
        for (var k = 0, _kLen = histogram.Histogram.length; k < _kLen; k++) {
            var barHeight = (0.5 + (h / (maxCount / histogram.Histogram[k].length))) | 0;
            var barX = (0.5 + (columnWidth * k)) | 0;
            chart += "<rect x='" + barX + "' y='" + (h - barHeight) + "' width='" + columnWidth + "' height='" + barHeight + "'></rect>";
        }
        chartWrapper.append(chart + "</svg>");
        //add the extra controls
        var p = $("#pv-filterpanel-category-numberitem-" + PivotViewer.Utils.EscapeMetaChars(facetName));
        p.append('</span><div id="pv-filterpanel-numericslider-' + facetName + '" class="pv-filterpanel-numericslider"></div><span class="pv-filterpanel-numericslider-range-min">' + histogram.Min + '</span><span class="pv-filterpanel-numericslider-range-max">' + histogram.Max + '</span>');
        var s = $('#pv-filterpanel-numericslider-' + PivotViewer.Utils.EscapeMetaChars(facetName));
        s.slider({
            range: true,
            min: histogram.Min,
            max: histogram.Max,
            values: [histogram.Min, histogram.Max],
            slide: function (event, ui) {
                $(this).parent().find('.pv-filterpanel-numericslider-range-val').text(ui.values[0] + " - " + ui.values[1]);
            },
            stop: function (event, ui) {
                var thisWrapped = $(this);
                var thisMin = thisWrapped.slider('option', 'min'),
                            thisMax = thisWrapped.slider('option', 'max');
                if (ui.values[0] > thisMin || ui.values[1] < thisMax)
                    thisWrapped.parent().parent().prev().find('.pv-filterpanel-accordion-heading-clear').css('visibility', 'visible');
                else if (ui.values[0] == thisMin && ui.values[1] == thisMax)
                    thisWrapped.parent().parent().prev().find('.pv-filterpanel-accordion-heading-clear').css('visibility', 'hidden');
                FilterCollection(false);
            }
        });
    };

    /// Creates and initialises the views - including plug-in views
    /// Init shared canvas
    CreateViews = function () {

        var viewPanel = $('.pv-viewpanel');
        var width = _self.width();
        var height = $('.pv-mainpanel').height();
        var offsetX = $('.pv-filterpanel').width() + 18;
        var offsetY = 4;

        //Create instances of all the views
        _views.push(new PivotViewer.Views.GridView());
        _views.push(new PivotViewer.Views.GraphView());
        _views.push(new PivotViewer.Views.TableView());
        if (_mapService == "Google")
          _views.push(new PivotViewer.Views.MapView());
        else
          _views.push(new PivotViewer.Views.MapView2());
        _views.push(new PivotViewer.Views.TimeView());

        //init the views interfaces
        for (var i = 0; i < _views.length; i++) {
            try {
                if (_views[i] instanceof PivotViewer.Views.IPivotViewerView) {
                    _views[i].Setup(width, height, offsetX, offsetY, _tileController.GetMaxTileRatio(), _nameMapping);
                    viewPanel.append("<div class='pv-viewpanel-view' id='pv-viewpanel-view-" + i + "'>" + _views[i].GetUI() + "</div>");
                    $('.pv-toolbarpanel-viewcontrols').append("<div class='pv-toolbarpanel-view' id='pv-toolbarpanel-view-" + i + "' title='" + _views[i].GetViewName() + "'><img id='pv-viewpanel-view-" + i + "-image' src='" + _views[i].GetButtonImage() + "' alt='" + _views[i].GetViewName() + "' /></div>");
                } else {
                    var msg = '';
                    msg = msg + 'View does not inherit from PivotViewer.Views.IPivotViewerView<br>';
                    $('.pv-wrapper').append("<div id=\"pv-view-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
                    window.open("#pv-view-error","_self")
                }
            } catch (ex) { alert(ex.Message); }
        }

       // The table, graph and the map view needs to know about the facet categories
       _views[1].SetFacetCategories(PivotCollection);
       _views[2].SetFacetCategories(PivotCollection);
       _views[3].SetFacetCategories(PivotCollection);
       _views[4].SetFacetCategories(PivotCollection);

       // Set which geocode service should be used by the map view
       _views[3].SetGeocodeService(_geocodeService);
       // Set map overlay url
       if (_overlayBaseUrl != "") 
           _views[3].SetOverlayBaseUrl(_overlayBaseUrl);
    }

    /// Google API has loaded
    global.setMapReady = function () {
        _googleAPILoaded = true;
        SelectView(3, true);
    };

    /// Set the current view
    SelectView = function (viewNumber, init) {

        // If changing to map view and the Google API has not yet loaded,
        // load it now.
        if (viewNumber == 3 && (_mapService == "Google" || _geocodeService == "Google") && !_googleAPILoaded && _googleAPIKey) {
            // Load the google maps api
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://maps.googleapis.com/maps/api/js?key=" + _googleAPIKey + "&sensor=false&callback=global.setMapReady";
            document.body.appendChild(script);
            return;
        }
        
        if (viewNumber == 3 && _mapService == "Google" && !_googleAPIKey) {
            var msg = '';
            msg = msg + 'Viewing the data on Google maps requires an API key. This can be obtained from <a href=\"https://code.google.com/apis/console/?noredirect\" target=\"_blank\">here</a>';
            $('.pv-wrapper').append("<div id=\"pv-nomapkey-error\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>" + msg + "</p></div></div>");
            var t=setTimeout(function(){window.open("#pv-nomapkey-error","_self")},1000)
            return;
        }

        //Deselect all views
        for (var i = 0; i < _views.length; i++) {
            if (viewNumber != i) {
                $('#pv-viewpanel-view-' + i + '-image').attr('src', _views[i].GetButtonImage());
                _views[i].Deactivate();
                _views[i].init = false;
            }
        }
        $('#pv-viewpanel-view-' + viewNumber + '-image').attr('src', _views[viewNumber].GetButtonImageSelected());
        if (_currentView == 1 && (viewNumber == 2 || viewNumber == 3 || viewNumber == 4)) {
            // Move tiles back to grid positions - helps with maintaining selected item 
            // when changing views
            _views[0].Activate();
            _views[0].init = init;
            _currentView = 0;
            FilterCollection(true);
        }
        _views[viewNumber].Activate();
        _views[viewNumber].init = init;

        _currentView = viewNumber;
        if (viewNumber == 1) {
          $.publish("/PivotViewer/Views/Item/Selected", [{id: "", bkt: 0}]);
          _selectedItem = "";
        }
        FilterCollection(true);
    };

    ///Sorts the facet items based on a specific sort type
    SortFacetItems = function (facetName) {
        if (PivotCollection.GetFacetCategoryByName(facetName).Type == PivotViewer.Models.FacetType.DateTime)
            return;
        //get facets
        var facetList = $("#pv-cat-" + PivotViewer.Utils.EscapeMetaChars(CleanName(facetName)) + " ul");
        var sortType = facetList.prev().text().replace("Sort: ", "");
        var facetItems = facetList.children("li").get();
        if (sortType == "A-Z") {
            facetItems.sort(function (a, b) {
                var compA = $(a).children().first().attr("itemvalue");
                var compB = $(b).children().first().attr("itemvalue");
                return (compA < compB) ? 1 : (compA > compB) ? -1 : 0;
            });
        } else if (sortType == "Quantity") {
            facetItems.sort(function (a, b) {
                var compA = parseInt($(a).children(".pv-facet-facetitem-count").text());
                var compB = parseInt($(b).children(".pv-facet-facetitem-count").text());
                return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
            });
        } else {
            var facet = PivotCollection.GetFacetCategoryByName(facetName);
            if (facet.CustomSort != undefined) {
                var sortList = [];
                for (var i = facet.CustomSort.SortValues.length - 1; i > -1; i -= 1) {
                    for (var j = 0; j < facetItems.length; j++) {
                        if (facet.CustomSort.SortValues[i] == $(facetItems[j]).children(".pv-facet-facetitem-label").text()) {
                            sortList.push(facetItems[j]);
                            found = true;
                        }
                    }
                }
                facetItems = sortList;
            }
        }
        for (var i = 0; i < facetItems.length; i++) {
            facetList.prepend(facetItems[i]);
        }
    };

    //Facet: splitItem[0], Operator: filter[0], Value: filter[1]
    //Applies the filters and sorted facet from the viewer state
    ApplyViewerState = function () {
        //Sort
        if (_viewerState.Facet != null) {
            $('.pv-toolbarpanel-sort option[value=' + CleanName(_viewerState.Facet) + ']').prop('selected', 'selected');
	    _currentSort = $('.pv-toolbarpanel-sort :selected').attr('label');
            PivotViewer.Debug.Log('current sort ' + _currentSort );
	}

        //Filters
        for (var i = 0, _iLen = _viewerState.Filters.length; i < _iLen; i++) {
            var showDateControls = false;
            for (var j = 0, _jLen = _viewerState.Filters[i].Predicates.length; j < _jLen; j++) {
                var operator = _viewerState.Filters[i].Predicates[j].Operator;
                if (operator == "GT" || operator == "GE" || operator == "LT" || operator == "LE") {
                    var s = $('#pv-filterpanel-numericslider-' + CleanName(_viewerState.Filters[i].Facet));
                    if (s.length > 0) { // a numeric value 
                        var intvalue = parseFloat(_viewerState.Filters[i].Predicates[j].Value);
                        switch (operator) {
                            case "GT":
                                s.slider("values", 0, intvalue + 1);
                                break;
                            case "GE":
                                s.slider("values", 0, intvalue);
                                break;
                            case "LT":
                                s.slider("values", 1, intvalue - 1);
                                break;
                            case "LE":
                                s.slider("values", 1, intvalue);
                                break;
                        }
                        s.parent().find('.pv-filterpanel-numericslider-range-val').text(s.slider("values", 0) + " - " + s.slider("values", 1));
                        s.parent().parent().prev().find('.pv-filterpanel-accordion-heading-clear').css('visibility', 'visible');
                    } else { // it must be a date range
                        var facetName = CleanName(_viewerState.Filters[i].Facet);
       	                var cb = $('#pv-facet-item-' + facetName + '___CustomRange')[0].firstElementChild;
                        cb.checked = true;
                        if (!showDateControls){
                            GetCustomDateRange(facetName);
                            showDateControls = true;
                        }
                        switch (operator) {
                            case "GE":
/*
        $('#pv-custom-range-' + facetName + '__Start').css('visibility', 'visible'); 
    $('#pv-custom-range-' + facetName + '__StartDate').datepicker({
            showOn: 'button',
            changeMonth: true,
            changeYear: true,
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: 'http://jqueryui.com/resources/demos/datepicker/images/calendar.gif'
        });
*/
                                $('#pv-custom-range-' + facetName + '__StartDate')[0].value = new Date(_viewerState.Filters[i].Predicates[j].Value);
                                CustomRangeChanged($('#pv-custom-range-' + facetName + '__StartDate')[0]);
                            break;
                            case "LE":
/*
        $('#pv-custom-range-' + facetName + '__Finish').css('visibility', 'visible'); 
        $('#pv-custom-range-' + facetName + '__FinishDate').datepicker({
            showOn: 'button',
            changeMonth: true,
            changeYear: true,
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: 'http://jqueryui.com/resources/demos/datepicker/images/calendar.gif'
        });
*/
                                $('#pv-custom-range-' + facetName + '__FinishDate')[0].value = new Date(_viewerState.Filters[i].Predicates[j].Value);
                                CustomRangeChanged($('#pv-custom-range-' + facetName+ '__FinishDate')[0]);
                            break;
                        }
                    }
                } else if (operator == "EQ") {
                    //String facet
                    SelectStringFacetItem(
                        CleanName(_viewerState.Filters[i].Facet),
                        CleanName(_viewerState.Filters[i].Predicates[j].Value)
                    );
                } else if (operator == "NT") {
                    //No Info string facet
                    SelectStringFacetItem(
                        CleanName(_viewerState.Filters[i].Facet),
                        "_no_info_"
                    );
                }
            }
        }
    };

    //Selects a string facet
    SelectStringFacetItem = function (facet, value) {
        var cb = $('.pv-facet-facetitem[itemfacet="' + facet + '"][itemvalue="' + value + '"]');
        cb.prop('checked', true);
        cb.parent().parent().parent().prev().find('.pv-filterpanel-accordion-heading-clear').css('visibility', 'visible');
    };

    /// Filters the collection of items and updates the views
    FilterCollection = function (changingView) {
        var filterItems = [];
        var foundItemsCount = [];
        var selectedFacets = [];
        var sort = _nameMapping[$('.pv-toolbarpanel-sort option:selected').attr('value')];
        PivotViewer.Debug.Log('sort ' + sort );

        if (!changingView)
            _selectedItem = "";

        //Filter String facet items
        var checked = $('.pv-facet-facetitem:checked');

        //Turn off clear all button
        $('.pv-filterpanel-clearall').css('visibility', 'hidden');

        //Filter String facet items
        //create an array of selected facets and values to compare to all items.
        var stringFacets = [];
        var datetimeFacets = [];
        for (var i = 0; i < checked.length; i++) {
            var facet = _nameMapping[$(checked[i]).attr('itemfacet')];
            var facetValue = _nameMapping[$(checked[i]).attr('itemvalue')];
            var category = PivotCollection.GetFacetCategoryByName(facet);
            if (category.Type == PivotViewer.Models.FacetType.String) {
                var found = false;
                for (var j = 0; j < stringFacets.length; j++) {
                    if (stringFacets[j].facet == facet) {
                        stringFacets[j].facetValue.push(facetValue);
                        found = true;
                    }
                }
                if (!found)
                    stringFacets.push({ facet: facet, facetValue: [facetValue] });
        
                //Add to selected facets list - this is then used to filter the facet list counts
                if ($.inArray(facet, selectedFacets) < 0)
                    selectedFacets.push(facet);
            } else if (category.Type == PivotViewer.Models.FacetType.DateTime) {
                
                var start = $('#pv-custom-range-' + CleanName(facet) + '__StartDate')[0].value;
                var end = $('#pv-custom-range-' + CleanName(facet) + '__FinishDate')[0].value;
                if (start && end) {
                    datetimeFacets.push({ facet: facet, facetValue: [facetValue], minDate: new Date(start), maxDate: new Date(end) });
                } else {
                var found = false;
                    for (var j = 0; j < datetimeFacets.length; j++) {
                        if (datetimeFacets[j].facet == facet) {
                            datetimeFacets[j].facetValue.push(facetValue);
                            found = true;
                        }
                    }
                    if (!found)
                        datetimeFacets.push({ facet: facet, facetValue: [facetValue] });
                }
        
                //Add to selected facets list - this is then used to filter the facet list counts
                if ($.inArray(facet, selectedFacets) < 0)
                    selectedFacets.push(facet);
        
            }
        }

        //Numeric facet items. Find all numeric types that have been filtered
        var numericFacets = [];
        for (var i = 0, _iLen = PivotCollection.FacetCategories.length; i < _iLen; i++) {
            if (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.Number) {
                var numbFacet = $('#pv-filterpanel-category-numberitem-' + CleanName(PivotCollection.FacetCategories[i].Name));
                var sldr = $(numbFacet).find('.pv-filterpanel-numericslider');
                if (sldr.length > 0) {
                    var range = sldr.slider("values");
                    var rangeMax = sldr.slider('option', 'max'), rangeMin = sldr.slider('option', 'min');
                    if (range[0] != rangeMin || range[1] != rangeMax) {
                        var facet = PivotCollection.FacetCategories[i].Name;
                        numericFacets.push({ facet: facet, selectedMin: range[0], selectedMax: range[1], rangeMin: rangeMin, rangeMax: rangeMax });
                        //Add to selected facets list - this is then used to filter the facet list counts
                        if ($.inArray(facet, selectedFacets) < 0)
                            selectedFacets.push(facet);
                    }
                }
            }
        }

        //Find matching facet values in items
        for (var i = 0, _iLen = PivotCollection.Items.length; i < _iLen; i++) {
            var foundCount = 0;

            //Look for ("no info") in string filters
            //Go through all filters facets 
            for (var k = 0, _kLen = stringFacets.length; k < _kLen; k++) {
                //Look for value matching "(no info)"
                for (var n = 0, _nLen = stringFacets[k].facetValue.length; n < _nLen; n++) {
                    if (stringFacets[k].facetValue[n] == "(no info)") {
                        // See if facet is defined for the item
                        var definedForItem = false;
                        for (var j = 0, _jLen = PivotCollection.Items[i].Facets.length; j < _jLen; j++) {
                            if (PivotCollection.Items[i].Facets[j].Name == stringFacets[k].facet){
                                //Facet is defined for that item
                                definedForItem = true;
                            }
                        }
                        //Tried all of the items facets
                        // Matches ("no info")
                        if (definedForItem == false)
                            foundCount++;
                    }
                }
            }

            for (var j = 0, _jLen = PivotCollection.Items[i].Facets.length; j < _jLen; j++) {
                //String facets
                for (var k = 0, _kLen = stringFacets.length; k < _kLen; k++) {
                    var valueFoundForFacet = 0;

                    if (PivotCollection.Items[i].Facets[j].Name == stringFacets[k].facet) {
                        for (var m = 0, _mLen = PivotCollection.Items[i].Facets[j].FacetValues.length; m < _mLen; m++) {
                            for (var n = 0, _nLen = stringFacets[k].facetValue.length; n < _nLen; n++) {
                                if (PivotCollection.Items[i].Facets[j].FacetValues[m].Value == stringFacets[k].facetValue[n])
                                    valueFoundForFacet++;
                            }
                        }
                    }
                    // Handles the posibility that and item might match several values of one facet
                    if (valueFoundForFacet > 0 )
                      foundCount++;
                }
            }

            //if the item was not in the string filters then exit early
            if (foundCount != stringFacets.length)
                continue;

            //Look for ("no info") in numeric filters
            //Go through all filters facets 
            for (var k = 0, _kLen = numericFacets.length; k < _kLen; k++) {
                //Look for value matching "(no info)"
                    if (numericFacets[k].selectedMin == "(no info)") {
                        // See if facet is defined for the item
                        var definedForItem = false;
                        for (var j = 0, _jLen = PivotCollection.Items[i].Facets.length; j < _jLen; j++) {
                            if (PivotCollection.Items[i].Facets[j].Name == numericFacets[k].facet){
                                //Facet is defined for that item
                                definedForItem = true;
                            }
                        }
                        //Tried all of the items facets
                        // Matches ("no info")
                        if (definedForItem == false)
                            foundCount++;
                    }
            }

            for (var j = 0, _jLen = PivotCollection.Items[i].Facets.length; j < _jLen; j++) {
                //Numeric facets
                for (var k = 0, _kLen = numericFacets.length; k < _kLen; k++) {
                    if (PivotCollection.Items[i].Facets[j].Name == numericFacets[k].facet) {
                        for (var m = 0, _mLen = PivotCollection.Items[i].Facets[j].FacetValues.length; m < _mLen; m++) {
                            var parsed = parseFloat(PivotCollection.Items[i].Facets[j].FacetValues[m].Value);
                            if (!isNaN(parsed) && parsed >= numericFacets[k].selectedMin && parsed <= numericFacets[k].selectedMax)
                                foundCount++;
                        }
                    }
                }
            }

            if (foundCount != (stringFacets.length + numericFacets.length))
                continue;

            //Look for ("no info") in datetime filters
            //Go through all filters facets 
            for (var k = 0, _kLen = datetimeFacets.length; k < _kLen; k++) {
                for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                    if (datetimeFacets[k].facetValue[n] == "(no info)") {
                        // See if facet is defined for the item
                        var definedForItem = false;
                        for (var j = 0, _jLen = PivotCollection.Items[i].Facets.length; j < _jLen; j++) {
                            if (PivotCollection.Items[i].Facets[j].Name == datetimeFacets[k].facet){
                                //Facet is defined for that item
                                definedForItem = true;
                            }
                        }
                        //Tried all of the items facets
                        // Matches ("no info")
                        if (definedForItem == false)
                            foundCount++;
                    }
                }
            }
            for (var j = 0, _jLen = PivotCollection.Items[i].Facets.length; j < _jLen; j++) {
                //DateTime facets
                for (var k = 0, _kLen = datetimeFacets.length; k < _kLen; k++) {
                    var valueFoundForFacet = 0;

                    if (PivotCollection.Items[i].Facets[j].Name == datetimeFacets[k].facet) {
                        if (datetimeFacets[k].minDate && datetimeFacets[k].maxDate) {
                            var itemDate = new Date (PivotCollection.Items[i].Facets[j].FacetValues[0].Value);
                            if ( itemDate <= datetimeFacets[k].maxDate &&
                                 itemDate >= datetimeFacets[k].minDate) {
                                valueFoundForFacet++;
                            }
                        } else {
                            var category = PivotCollection.GetFacetCategoryByName(datetimeFacets[k].facet);
                            // So I have the itemId PivotCollection.Items[i].Id
                            // I have the selected bucket
                            // I need to find the selected bucket in one of the bucket arrays but I don't know which one
                            // First search the decade buckets
                            for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                                for (l = 0; l < category.decadeBuckets.length; l++) {
                                    if (category.decadeBuckets[l].Name == datetimeFacets[k].facetValue[n]) 
                                        for (var m = 0; m < category.decadeBuckets[l].Items.length; m++) {
                                            if (category.decadeBuckets[l].Items[m] == PivotCollection.Items[i].Id)
                                                valueFoundForFacet++;
                                        }
                                }
                            }
                            // year buckets
                            for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                                for (l = 0; l < category.yearBuckets.length; l++) {
                                    if (category.yearBuckets[l].Name == datetimeFacets[k].facetValue[n]) 
                                        for (var m = 0; m < category.yearBuckets[l].Items.length; m++) {
                                            if (category.yearBuckets[l].Items[m] == PivotCollection.Items[i].Id)
                                                valueFoundForFacet++;
                                        }
                                }
                            }
                            // month buckets
                            for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                                for (l = 0; l < category.monthBuckets.length; l++) {
                                    if (category.monthBuckets[l].Name == datetimeFacets[k].facetValue[n]) 
                                        for (var m = 0; m < category.monthBuckets[l].Items.length; m++) {
                                            if (category.monthBuckets[l].Items[m] == PivotCollection.Items[i].Id)
                                                valueFoundForFacet++;
                                        }
                                }
                            }
                            // day buckets
                            for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                                for (l = 0; l < category.dayBuckets.length; l++) {
                                    if (category.dayBuckets[l].Name == datetimeFacets[k].facetValue[n]) 
                                        for (var m = 0; m < category.dayBuckets[l].Items.length; m++) {
                                            if (category.dayBuckets[l].Items[m] == PivotCollection.Items[i].Id)
                                                valueFoundForFacet++;
                                        }
                                }
                            }
                            // hour buckets
                            for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                                for (l = 0; l < category.hourBuckets.length; l++) {
                                    if (category.hourBuckets[l].Name == datetimeFacets[k].facetValue[n]) 
                                        for (var m = 0; m < category.hourBuckets[l].Items.length; m++) {
                                            if (category.hourBuckets[l].Items[m] == PivotCollection.Items[i].Id)
                                                valueFoundForFacet++;
                                        }
                                }
                            }
                            // minute buckets
                            for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                                for (l = 0; l < category.minuteBuckets.length; l++) {
                                    if (category.minuteBuckets[l].Name == datetimeFacets[k].facetValue[n]) 
                                        for (var m = 0; m < category.minuteBuckets[l].Items.length; m++) {
                                            if (category.minuteBuckets[l].Items[m] == PivotCollection.Items[i].Id)
                                                valueFoundForFacet++;
                                        }
                                }
                            }
                            // second buckets
                            for (var n = 0, _nLen = datetimeFacets[k].facetValue.length; n < _nLen; n++) {
                                for (l = 0; l < category.secondBuckets.length; l++) {
                                    if (category.secondBuckets[l].Name == datetimeFacets[k].facetValue[n]) 
                                        for (var m = 0; m < category.secondBuckets[l].Items.length; m++) {
                                            if (category.secondBuckets[l].Items[m] == PivotCollection.Items[i].Id)
                                                valueFoundForFacet++;
                                        }
                                }
                            }
                        }
                    }
                    // Handles the posibility that and item might match several values of one facet
                    if (valueFoundForFacet > 0 )
                      foundCount++;
                }
            }

            if (foundCount != (stringFacets.length + numericFacets.length + datetimeFacets.length))
                continue;

            //Item is in all filters
            filterItems.push(PivotCollection.Items[i].Id);

            if ((stringFacets.length + numericFacets.length + datetimeFacets.length) > 0)
                $('.pv-filterpanel-clearall').css('visibility', 'visible');
        }

	// Tidy this up
	_numericFacets = numericFacets;
	_stringFacets = stringFacets;
	_datetimeFacets = datetimeFacets;

        $('.pv-viewpanel-view').hide();
        $('#pv-viewpanel-view-' + _currentView).show();
        //Filter the facet counts and remove empty facets
        FilterFacets(filterItems, selectedFacets);

        //Update breadcrumb
        UpdateBreadcrumbNavigation(stringFacets, numericFacets, datetimeFacets);

        //Filter view
        _tileController.SetCircularEasingBoth();
        if (!_handledInitSettings){
            if (_currentView == 2) { 
                _views[_currentView].SetSelectedFacet(_initTableFacet);
                _views[_currentView].Filter(_tiles, filterItems, sort, stringFacets, changingView, _initSelectedItem);
            } else if (_currentView == 3) {
                _views[_currentView].SetMapInitCentreX(_initMapCentreX);
                _views[_currentView].SetMapInitCentreY(_initMapCentreY);
                _views[_currentView].SetMapInitType(_initMapType);
                _views[_currentView].SetMapInitZoom(_initMapZoom);
                _views[_currentView].applyBookmark = true;
                _views[_currentView].Filter(_tiles, filterItems, sort, stringFacets, changingView, _initSelectedItem);
            } else if (_currentView == 4) {
                _views[_currentView].SetSelectedFacet(_initTimelineFacet);
                _views[_currentView].Filter(_tiles, filterItems, sort, stringFacets, changingView, _initSelectedItem);
            } else 
                _views[_currentView].Filter(_tiles, filterItems, sort, stringFacets, changingView, _selectedItem);
            _handledInitSettings = true;
        }
        else {
            _views[_currentView].Filter(_tiles, filterItems, sort, stringFacets, changingView, _selectedItem);
            if ((_currentView == 2 || _currentView == 3 || _currentView == 4) && !changingView) { 
                _views[0].Filter(_tiles, filterItems, sort, stringFacets, false, "");
            }
        }

        // Maintain a list of items in the filter in sort order.
        var sortedFilter = [];
        // More compicated for the graphview...
        if (_views[_currentView].GetViewName() == 'Graph View')
           sortedFilter = _views[_currentView].GetSortedFilter();
        else {
            for (var i = 0; i < _views[_currentView].tiles.length; i++) {
                var filterindex = $.inArray(_views[_currentView].tiles[i].facetItem.Id, filterItems);
                if (filterindex >= 0) {
                    var obj = new Object ();
                    obj.Id = _views[_currentView].tiles[i].facetItem.Id;
                    obj.Bucket = 0;
                    sortedFilter.push(obj);
                }
            }
        }
        _filterItems = sortedFilter;

	// Update the bookmark
        UpdateBookmark ();

        DeselectInfoPanel();
    };

    BucketCounts = function (bucketArray, name, itemsArray) {
        for (var i = 0; i < bucketArray.length; i++) {
            var datetimeitem = $('#pv-facet-item-' + CleanName(name) + "__" + CleanName(bucketArray[i].Name.toString()));
            var count = 0;
            for (var j = 0; j < itemsArray.length; j++) {
                if (bucketArray[i].Items.indexOf(itemsArray[j]) != -1) 
                     count++;
            }
            datetimeitem.find('span').last().text(count);
            if (count == 0)
                datetimeitem.hide();
            else
                datetimeitem.show();
        }
    };

    GetDateTimeItemCounts = function (category, filterItems) {
        if (category.decadeBuckets.length > 0) {
            for (var i = 0; i < category.decadeBuckets.length; i++) {
                var datetimeitem = $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.decadeBuckets[i].Name.toString()));
                datetimeitem.find('span').last().text(category.decadeBuckets[i].Items.length);
                datetimeitem.show();
            }
        }

        if (category.yearBuckets.length > 0) {
            for (var i = 0; i < category.yearBuckets.length; i++) {
                var datetimeitem = $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.yearBuckets[i].Name.toString()));
                datetimeitem.find('span').last().text(category.yearBuckets[i].Items.length);
                datetimeitem.show();
            }
        }

        if (category.monthBuckets.length > 0) {
            for (var i = 0; i < category.monthBuckets.length; i++) {
                var datetimeitem = $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.monthBuckets[i].Name.toString()));
                datetimeitem.find('span').last().text(category.monthBuckets[i].Items.length);
                datetimeitem.show();
            }
        }

        if (category.dayBuckets.length > 0) {
            for (var i = 0; i < category.dayBuckets.length; i++) {
                var datetimeitem = $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.dayBuckets[i].Name.toString()));
                datetimeitem.find('span').last().text(category.dayBuckets[i].Items.length);
                datetimeitem.show();
            }
        }

        if (category.hourBuckets.length > 0) {
            for (var i = 0; i < category.hourBuckets.length; i++) {
                var datetimeitem = $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.hourBuckets[i].Name.toString()));
                datetimeitem.find('span').last().text(category.hourBuckets[i].Items.length);
                datetimeitem.show();
            }
        }

        if (category.minuteBuckets.length > 0) { 
            for (var i = 0; i < category.minuteBuckets.length; i++) {
                var datetimeitem = $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.minuteBuckets[i].Name.toString()));
                datetimeitem.find('span').last().text(category.minuteBuckets[i].Items.length);
                datetimeitem.show();
            }
        }

        if (category.secondBuckets.length > 0) { 
            for (var i = 0; i < category.secondBuckets.length; i++) {
                var datetimeitem = $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.secondBuckets[i].Name.toString()));
                datetimeitem.find('span').last().text(category.secondBuckets[i].Items.length);
                datetimeitem.show();
            }
        }
    };

    /// Filters the facet panel items and updates the counts
    FilterFacets = function (filterItems, selectedFacets) {
        //if all the items are visible then update all
        if (filterItems.length == PivotCollection.Items.length) {

            //DateTime facets
            for (var i = 0; i < PivotCollection.FacetCategories.length; i++) {
                if (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.DateTime)
                    GetDateTimeItemCounts(PivotCollection.FacetCategories[i], filterItems);
            }

            //String facets
            for (var i = _facetItemTotals.length - 1; i > -1; i -= 1) {
                var item = $('#' + PivotViewer.Utils.EscapeMetaChars(_facetItemTotals[i].itemId));
                item.show();
                item.find('span').last().text(_facetItemTotals[i].count);
            }

            //Numeric facets
            //re-create the histograms
            for (var i = 0; i < _facetNumericItemTotals.length; i++)
                CreateNumberFacet(CleanName(_facetNumericItemTotals[i].Facet), _facetNumericItemTotals[i].Values);

            return;
        }

        var filterList = []; //used for string facets
        var numericFilterList = []; //used for number facets
        var datetimeFilterList = []; //used for datetime facets

        //Create list of items to display
        for (var i = filterItems.length - 1; i > -1; i -= 1) {
            var item = PivotCollection.GetItemById(filterItems[i]);
            for (var m = 0; m < PivotCollection.FacetCategories.length; m++) {
                if (PivotCollection.FacetCategories[m].IsFilterVisible) {
                    //If it's a visible filter then determine if it has a value
                    var hasValue = false;
                    for (var j = item.Facets.length - 1; j > -1; j -= 1) {
                        if (item.Facets[j].Name == PivotCollection.FacetCategories[m].Name) {
                            //If not in the selected facet list then determine count
                            if ($.inArray(item.Facets[j].Name, selectedFacets) < 0) {
                                var facetCategory = PivotCollection.GetFacetCategoryByName(item.Facets[j].Name);
                                if (facetCategory.IsFilterVisible) {
                                    for (var k = item.Facets[j].FacetValues.length - 1; k > -1; k -= 1) {
                                        //String Facets
                                        if (facetCategory.Type == PivotViewer.Models.FacetType.String) {
                                            var filteredItem = { item: '#' + PivotViewer.Utils.EscapeMetaChars('pv-facet-item-' + CleanName(item.Facets[j].Name) + '__' + CleanName(item.Facets[j].FacetValues[k].Value)), count: 1 };
                                            var found = false;
                                            for (var n = filterList.length - 1; n > -1; n -= 1) {
                                                if (filterList[n].item == filteredItem.item) {
                                                    filterList[n].count += 1;
                                                    found = true;
                                                    break;
                                                }
                                            }
                                            if (!found)
                                                filterList.push(filteredItem);
                                        }
                                        else if (facetCategory.Type == PivotViewer.Models.FacetType.Number) {
                                            //collect all the numbers to update the histogram
                                            var numFound = false;
                                            for (var n = 0; n < numericFilterList.length; n++) {
                                                if (numericFilterList[n].Facet == item.Facets[j].Name) {
                                                    numericFilterList[n].Values.push(item.Facets[j].FacetValues[k].Value);
                                                    numFound = true;
                                                    break;
                                                }
                                            }
                                            if (!numFound)
                                                numericFilterList.push({ Facet: item.Facets[j].Name, Values: [item.Facets[j].FacetValues[k].Value] });
                                        } // do datetime facets separately....
                                    }
                                }
                            }
                            hasValue = true;
                        }
                    }

                    if (!hasValue) {
                        //increment count for (no info)
                        var filteredItem = { item: '#' + PivotViewer.Utils.EscapeMetaChars('pv-facet-item-' + CleanName(PivotCollection.FacetCategories[m].Name) + '__' + CleanName('(no info)')), count: 1 };
                        var found = false;
                        for (var n = filterList.length - 1; n > -1; n -= 1) {
                            if (filterList[n].item == filteredItem.item) {
                                filterList[n].count += 1;
                                found = true;
                                break;
                            }
                        }
                        if (!found)
                            filterList.push(filteredItem);
                    }
                }
            }
        }

        //String facets
        //iterate over all facet items to set it's visibility and count
        for (var i = _facetItemTotals.length - 1; i > -1; i -= 1) {
            if ($.inArray(_facetItemTotals[i].facet, selectedFacets) < 0) {
                //loop over all and hide those not in filterList	
                var found = false;
                for (var j = filterList.length - 1; j > -1; j -= 1) {
                    if (filterList[j].item == _facetItemTotals[i].itemId) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    $('#' + PivotViewer.Utils.EscapeMetaChars(_facetItemTotals[i].itemId)).hide();
            } else {
                //Set count for selected facets
                $('#' + PivotViewer.Utils.EscapeMetaChars(_facetItemTotals[i].itemId)).find('span').last().text(_facetItemTotals[i].count);
            }
        }

        //display relevant items
        for (var i = filterList.length - 1; i > -1; i -= 1) {
            var facetItem = $(filterList[i].item);
            if (facetItem.length > 0) {
                facetItem.show();
                var itemCount = facetItem.find('span').last();
                itemCount.text(filterList[i].count);
            }
        }

        //Numeric facets
        //re-create the histograms
        for (var i = 0; i < numericFilterList.length; i++)
            CreateNumberFacet(CleanName(numericFilterList[i].Facet), numericFilterList[i].Values);

        //Datetime facet
        //Find the datetime buckets that we are displaying and set relevant
        //visibility and counts
        for (var i = 0; i < PivotCollection.FacetCategories.length; i++) {
            if ($.inArray(PivotCollection.FacetCategories[i].Name, selectedFacets) < 0) {
                if (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.DateTime ) {
                    var category = PivotCollection.FacetCategories[i];
        
                    if (category.decadeBuckets.length > 0 && $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.decadeBuckets[0].Name.toString())).css('visibility') != 'hidden') 
                        BucketCounts(category.decadeBuckets, category.Name, filterItems);
                    if (category.yearBuckets.length > 0 && $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.yearBuckets[0].Name.toString())).css('visibility') != 'hidden') 
                        BucketCounts(category.yearBuckets, category.Name, filterItems);
                    if (category.monthBuckets.length > 0 && $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.monthBuckets[0].Name.toString())).css('visibility') != 'hidden') 
                        BucketCounts(category.monthBuckets, category.Name, filterItems);
                    if (category.dayBuckets.length > 0 && $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.dayBuckets[0].Name.toString())).css('visibility') != 'hidden') 
                        BucketCounts(category.dayBuckets, category.Name, filterItems);
                    if (category.hourBuckets.length > 0 && $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.hourBuckets[0].Name.toString())).css('visibility') != 'hidden') 
                        BucketCounts(category.hourBuckets, category.Name, filterItems);
                    if (category.minuteBuckets.length > 0 && $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.minuteBuckets[0].Name.toString())).css('visibility') != 'hidden') 
                        BucketCounts(category.minuteBuckets, category.Name, filterItems);
                    if (category.secondBuckets.length > 0 && $('#pv-facet-item-' + CleanName(category.Name) + "__" + CleanName(category.secondBuckets[0].Name.toString())).css('visibility') != 'hidden') 
                        BucketCounts(category.secondBuckets, category.Name, filterItems);
                }
            }
        }
    };

    UpdateBreadcrumbNavigation = function (stringFacets, numericFacets, datetimeFacets) {
        var bc = $('.pv-toolbarpanel-facetbreadcrumb');
        bc.empty();

        if (stringFacets.length == 0 && numericFacets.length == 0 && datetimeFacets.length == 0)
            return;

        var bcItems = "|";
        for (var i = 0, _iLen = stringFacets.length; i < _iLen; i++) {
            bcItems += "<span class='pv-toolbarpanel-facetbreadcrumb-facet'>" + stringFacets[i].facet + ":</span><span class='pv-toolbarpanel-facetbreadcrumb-values'>"
            bcItems += stringFacets[i].facetValue.join(', ');
            bcItems += "</span><span class='pv-toolbarpanel-facetbreadcrumb-separator'>&gt;</span>";
        }

        for (var i = 0, _iLen = numericFacets.length; i < _iLen; i++) {
            bcItems += "<span class='pv-toolbarpanel-facetbreadcrumb-facet'>" + numericFacets[i].facet + ":</span><span class='pv-toolbarpanel-facetbreadcrumb-values'>"
            if (numericFacets[i].selectedMin == numericFacets[i].rangeMin)
                bcItems += "Under " + numericFacets[i].selectedMax;
            else if (numericFacets[i].selectedMax == numericFacets[i].rangeMax)
                bcItems += "Over " + numericFacets[i].selectedMin;
            else
                bcItems += numericFacets[i].selectedMin + " - " + numericFacets[i].selectedMax;
            bcItems += "</span><span class='pv-toolbarpanel-facetbreadcrumb-separator'>&gt;</span>";
        }

        for (var i = 0, _iLen = datetimeFacets.length; i < _iLen; i++) {
            if (datetimeFacets[i].maxDate && datetimeFacets[i].minDate) {
                bcItems += "<span class='pv-toolbarpanel-facetbreadcrumb-facet'>" + datetimeFacets[i].facet + ":</span><span class='pv-toolbarpanel-facetbreadcrumb-values'>"
                bcItems += "Between " + datetimeFacets[i].minDate + " and " + datetimeFacets[i].maxDate;
                bcItems += "</span><span class='pv-toolbarpanel-facetbreadcrumb-separator'>&gt;</span>";
            } else {
                bcItems += "<span class='pv-toolbarpanel-facetbreadcrumb-facet'>" + datetimeFacets[i].facet + ":</span><span class='pv-toolbarpanel-facetbreadcrumb-values'>"
                bcItems += datetimeFacets[i].facetValue.join(', ');
                bcItems += "</span><span class='pv-toolbarpanel-facetbreadcrumb-separator'>&gt;</span>";
            }
        }
        bc.append(bcItems);
    };

    DeselectInfoPanel = function () {
        //de-select details
        $('.pv-infopanel').fadeOut();
        $('.pv-infopanel-heading').empty();
        $('.pv-infopanel-details').empty();
    };

    /// Gets the all the items who have a facet value == value
    GetItemIds = function (facetName, value) {
        var foundId = [];
        for (var i = 0; i < PivotCollection.Items.length; i++) {
            var found = false;
            for (var j = 0; j < PivotCollection.Items[i].Facets.length; j++) {
                if (PivotCollection.Items[i].Facets[j].Name == facetName) {
                    for (var k = 0; k < PivotCollection.Items[i].Facets[j].FacetValues.length; k++) {
                        if (value == PivotCollection.Items[i].Facets[j].FacetValues[k].Value)
                            foundId.push(PivotCollection.Items[i].Id);
                    }
                    found = true;
                }
            }
            if (!found && value == "(no info)") {
                foundId.push(PivotCollection.Items[i].Id);
            }
        }
        return foundId;
    };

    GetItem = function (itemId) {
        for (var i = 0; i < PivotCollection.Items.length; i++) {
            if (PivotCollection.Items[i].Id == itemId)
                return PivotCollection.Items[i];
        }
        return null;
    };

    UpdateBookmark = function ()
        {
            // CurrentViewerState
            var currentViewerState = "#";

            // Add the ViewerState fragment
	    // Add view
	    var viewNum = _currentView + 1;
	    currentViewerState += "$view$=" + viewNum;
	    // Add sort facet
	    if ( _currentSort )
	    	currentViewerState += "&$facet0$=" + _currentSort;
	    // Add selection
	    if ( _selectedItem )
	    	currentViewerState += "&$selection$=" + _selectedItem.Id;
            // Handle bookmark params for specific views
            if (_currentView == 2)
                if (_views[_currentView].GetSelectedFacet())
	    	  currentViewerState += "&$tableFacet$=" + _views[_currentView].GetSelectedFacet();
            if (_currentView == 3) {
                if (_views[_currentView].GetMapCentreX())
	    	  currentViewerState += "&$mapCentreX$=" + _views[_currentView].GetMapCentreX();
                if (_views[_currentView].GetMapCentreY())
	    	  currentViewerState += "&$mapCentreY$=" + _views[_currentView].GetMapCentreY();
                if (_views[_currentView].GetMapType())
	    	  currentViewerState += "&$mapType$=" + _views[_currentView].GetMapType();
                if (_views[_currentView].GetMapZoom())
	    	  currentViewerState += "&$mapZoom$=" + _views[_currentView].GetMapZoom();
            }
            if (_currentView == 4) 
                if (_views[_currentView].GetSelectedFacet())
	    	  currentViewerState += "&$timelineFacet$=" + _views[_currentView].GetSelectedFacet();
	    // Add filters and create title
            var title = PivotCollection.CollectionName;
            if (_numericFacets.length + _stringFacets.length > 0)
                title = title + " | ";

	    if (_stringFacets.length > 0 ) {
		for ( i = 0; i < _stringFacets.length; i++ ) {
			for ( j = 0; j < _stringFacets[i].facetValue.length; j++ ) {
	        	    currentViewerState += "&";
			    currentViewerState += _stringFacets[i].facet;
			    currentViewerState += "=EQ." + _stringFacets[i].facetValue[j];
			}
			title += _stringFacets[i].facet + ": ";
			title += _stringFacets[i].facetValue.join(', ');;
			if ( i < _stringFacets.length - 1)
			    title += " > "
	        }
	    }
	    if (_numericFacets.length > 0 ) {
		for ( i = 0; i < _numericFacets.length; i++ ) {
	        	currentViewerState += "&";
			currentViewerState += _numericFacets[i].facet;
			title += _numericFacets[i].facet + ": ";
			if (_numericFacets[i].selectedMin == _numericFacets[i].rangeMin) {
			    currentViewerState += "=LE." + _numericFacets[i].selectedMax;
			    title += "Under " + _numericFacets[i].selectedMax;
			} else if (_numericFacets[i].selectedMax == _numericFacets[i].rangeMax) {
			    currentViewerState += "=GE." + _numericFacets[i].selectedMin;
			    title += "Over " + _numericFacets[i].selectedMin;
			} else {
			    currentViewerState += "=GE." + _numericFacets[i].selectedMin + "_LE." + _numericFacets[i].selectedMax;
			    title += "Between " + _numericFacets[i].selectedMin + " and " + _numericFacets[i].selectedMax;
			}
			if ( i < _numericFacets.length - 1)
			    title += " > "
	        }
	    }
	    if (_datetimeFacets.length > 0 ) {
		for ( i = 0; i < _datetimeFacets.length; i++ ) {
			for ( j = 0; j < _datetimeFacets[i].facetValue.length; j++ ) {
	        	    currentViewerState += "&";
			    currentViewerState += _datetimeFacets[i].facet;
			    title += _datetimeFacets[i].facet + ": ";
                            if (_datetimeFacets[i].maxDate && _datetimeFacets[i].minDate) {
			        currentViewerState += "=GE." + _datetimeFacets[i].minDate + "_LE." + _datetimeFacets[i].maxDate;
			        title += "Between " + _datetimeFacets[i].minDate + " and " + _datetimeFacets[i].maxDate;
                            } else {
			        currentViewerState += "=EQ." + _datetimeFacets[i].facetValue[j];
			        title += _datetimeFacets[i].facetValue.join(', ');
			    }
			}
			if ( i < _datetimeFacets.length - 1)
			    title += " > "
	        }
	    }

            // Permalink bookmarks can be enabled by implementing a function 
            // SetBookmark(bookmark string, title string)  
            if ( typeof (SetBookmark) != undefined && typeof(SetBookmark) === "function") { 
                SetBookmark( PivotCollection.CollectionBaseNoProxy, currentViewerState, title);
            }
        };

    CleanName = function (uncleanName) {
        name = uncleanName.replace(/[^\w]/gi, '_');
        _nameMapping[name] = uncleanName;      
        return name;
    }

    //Events
    //Collection loading complete
    $.subscribe("/PivotViewer/Models/Collection/Loaded", function (event) {
        InitTileCollection();
    });

    //Image Collection loading complete
    $.subscribe("/PivotViewer/ImageController/Collection/Loaded", function (event) {
        InitPivotViewer();
        var filterPanel = $('.pv-filterpanel');
        filterPanel.append("<div class='pv-filterpanel-version'><a href=\"#pv-open-version\">About HTHL5 PivotViewer</a></div>");
        filterPanel.append("<div id=\"pv-open-version\" class=\"pv-modal-dialog\"><div><a href=\"#pv-modal-dialog-close\" title=\"Close\" class=\"pv-modal-dialog-close\">X</a><h2>HTML5 PivotViewer</h2><p>Version: " + $(PivotViewer)[0].Version + "</p><p>The sources are available on <a href=\"https://github.com/openlink/html5pivotviewer\" target=\"_blank\">github</a></p></div></div>");
    });

    //Item selected - show the info panel
    $.subscribe("/PivotViewer/Views/Item/Selected", function (evt) {

        if (evt.id === undefined || evt.id === null || evt.id === "") {
            DeselectInfoPanel();
            _selectedItem = "";
            if (_currentView == 2)
                _views[_currentView].Selected(_selectedItem.Id); 
	    // Update the bookmark
            UpdateBookmark ();
            return;
        }

        //if (evt.length > 0) {
        var selectedItem = GetItem(evt.id);
        if (selectedItem != null) {
            var alternate = true;
            if ($('.pv-mapview-legend').is(":visible"))
                $('.pv-mapview-legend').hide('slide', {direction: 'up'});
            $('.pv-infopanel-heading').empty();
            $('.pv-infopanel-heading').append("<a href=\"" + selectedItem.Href + "\" target=\"_blank\">" + selectedItem.Name + "</a></div>");
            var infopanelDetails = $('.pv-infopanel-details');
            infopanelDetails.empty();
            if (selectedItem.Description != undefined && selectedItem.Description.length > 0) {
                infopanelDetails.append("<div class='pv-infopanel-detail-description' style='height:100px;'>" + selectedItem.Description + "</div><div class='pv-infopanel-detail-description-more'>More</div>");
            }
            // nav arrows...
            if (selectedItem.Id == _filterItems[0].Id && selectedItem == _filterItems[_filterItems.length - 1]) {
                $('.pv-infopanel-controls-navright').hide();
                $('.pv-infopanel-controls-navrightdisabled').show();
                $('.pv-infopanel-controls-navleft').hide();
                $('.pv-infopanel-controls-navleftdisabled').show();
            } else if (selectedItem.Id == _filterItems[0].Id) {
                $('.pv-infopanel-controls-navleft').hide();
                $('.pv-infopanel-controls-navleftdisabled').show();
                $('.pv-infopanel-controls-navright').show();
                $('.pv-infopanel-controls-navrightdisabled').hide();
            } else if (selectedItem.Id == _filterItems[_filterItems.length - 1].Id) {
                $('.pv-infopanel-controls-navright').hide();
                $('.pv-infopanel-controls-navrightdisabled').show();
                $('.pv-infopanel-controls-navleft').show();
                $('.pv-infopanel-controls-navleftdisabled').hide();
            } else {
                $('.pv-infopanel-controls-navright').show();
                $('.pv-infopanel-controls-navrightdisabled').hide();
                $('.pv-infopanel-controls-navleft').show();
                $('.pv-infopanel-controls-navleftdisabled').hide();
            }

            var detailDOM = [];
            var detailDOMIndex = 0;
            for (var i = 0; i < selectedItem.Facets.length; i++) {
                //check for IsMetaDataVisible
                var IsMetaDataVisible = false;
                var IsFilterVisible = false;
                for (var j = 0; j < PivotCollection.FacetCategories.length; j++) {
                    if (PivotCollection.FacetCategories[j].Name == selectedItem.Facets[i].Name && PivotCollection.FacetCategories[j].IsMetaDataVisible) {
                        IsMetaDataVisible = true;
                        IsFilterVisible = PivotCollection.FacetCategories[j].IsFilterVisible;
                        break;
                    }
                }

                if (IsMetaDataVisible) {
                    detailDOM[detailDOMIndex] = "<div class='pv-infopanel-detail " + (alternate ? "detail-dark" : "detail-light") + "'><div class='pv-infopanel-detail-item detail-item-title' pv-detail-item-title='" + selectedItem.Facets[i].Name + "'>" + PivotViewer.Utils.StripVirtcxml(selectedItem.Facets[i].Name) + "</div>";
                    for (var j = 0; j < selectedItem.Facets[i].FacetValues.length; j++) {
                        detailDOM[detailDOMIndex] += "<div pv-detail-item-value='" + selectedItem.Facets[i].FacetValues[j].Value + "' class='pv-infopanel-detail-item detail-item-value" + (IsFilterVisible ? " detail-item-value-filter" : "") + "'>";
                        if (selectedItem.Facets[i].FacetValues[j].Href != null)
                            detailDOM[detailDOMIndex] += "<a class='detail-item-link' href='" + selectedItem.Facets[i].FacetValues[j].Href + "'>" + selectedItem.Facets[i].FacetValues[j].Value + "</a>";
                        else
                            detailDOM[detailDOMIndex] += selectedItem.Facets[i].FacetValues[j].Value;
                        detailDOM[detailDOMIndex] += "</div>";
                    }
                    detailDOM[detailDOMIndex] += "</div>";
                    detailDOMIndex++;
                    alternate = !alternate;
                }
            }
            if (selectedItem.Links.length > 0) {
                $('.pv-infopanel-related').empty();
                for (var k = 0; k < selectedItem.Links.length; k++) {
                    $('.pv-infopanel-related').append("<a href='" + selectedItem.Links[k].Href + "'>" + selectedItem.Links[k].Name + "</a><br>");
                }
            }
            infopanelDetails.append(detailDOM.join(''));
            $('.pv-infopanel').fadeIn();
            infopanelDetails.css('height', ($('.pv-infopanel').height() - ($('.pv-infopanel-controls').height() + $('.pv-infopanel-heading').height() + $('.pv-infopanel-copyright').height() + $('.pv-infopanel-related').height()) - 20) + 'px');
            _selectedItem = selectedItem;
            _selectedItemBkt = evt.bkt;

            if (_currentView == 2 || _currentView == 4)
                _views[_currentView].Selected(_selectedItem.Id); 
            if (_currentView == 3) 
                _views[_currentView].RedrawMarkers(_selectedItem.Id); 

	    // Update the bookmark
            UpdateBookmark ();

            return;
        }

    });

    //Filter the facet list
    $.subscribe("/PivotViewer/Views/Item/Filtered", function (evt) {
        if (evt == undefined || evt == null)
            return;

        // If the facet used for the sort is the same as the facet that the filter is 
        // changing on then clear all the other values?
        // This is only the case when comming from drill down in the graph view.
        if (evt.ClearFacetFilters == true) {
            for (var i = 0, _iLen = PivotCollection.FacetCategories.length; i < _iLen; i++) {
                if (PivotCollection.FacetCategories[i].Name == evt.Facet && 
                    (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.String ||
                    PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.DateTime)) {
                    var checkedValues = $('.pv-facet-facetitem[itemfacet="' + CleanName(evt.Facet.toString()) + '"]')
                    for (var j = 0; j < checkedValues.length; j++) {
                        $(checkedValues[j]).prop('checked', false);
                    }
                }
            }
        }

        for (var i = 0, _iLen = PivotCollection.FacetCategories.length; i < _iLen; i++) {
            if (PivotCollection.FacetCategories[i].Name == evt.Facet && 
                (PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.String ||
                PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.DateTime)) {

                if (evt.Values) {
	            for ( var j = 0; j < evt.Values.length; j++) {
                        var cb = $(PivotViewer.Utils.EscapeMetaChars("#pv-facet-item-" + CleanName(evt.Facet.toString()) + "__" + CleanName(evt.Values[j].toString())) + " input");
                        cb.prop('checked', true);
                        FacetItemClick(cb[0]);
                    }
                } else {
                    var cb = $(PivotViewer.Utils.EscapeMetaChars("#pv-facet-item-" + CleanName(evt.Facet.toString()) + "__" + CleanName(evt.Item.toString())) + " input");
                    cb.prop('checked', true);
                    FacetItemClick(cb[0]);
                }
            }
            if (PivotCollection.FacetCategories[i].Name == evt.Facet && 
                PivotCollection.FacetCategories[i].Type == PivotViewer.Models.FacetType.Number) {
                var s = $('#pv-filterpanel-numericslider-' + PivotViewer.Utils.EscapeMetaChars(evt.Facet));
                FacetSliderDrag(s, evt.Item, evt.MaxRange);
            }
        }
    });

    //Trigger a bookmark update
    $.subscribe("/PivotViewer/Views/Item/Updated", function () {
        UpdateBookmark ();
    });
 
    //Changing to grid view
    $.subscribe("/PivotViewer/Views/ChangeTo/Grid", function (evt) {
        var selectedTile = "";
        for ( t = 0; t < _tiles.length; t ++ ) {
            if (_tiles[t].facetItem == evt.Item) {
               selectedTile = _tiles[t];
               break;
            }
        }
        if (selectedTile)
             $.publish("/PivotViewer/Views/Canvas/Click", [{ x: selectedTile._locations[selectedTile.selectedLoc].destinationx + selectedTile.destinationwidth/2, y: selectedTile._locations[selectedTile.selectedLoc].destinationy + selectedTile.destinationheight/2}]);
    });

    $.subscribe("/PivotViewer/Views/Update/GridSelection", function (evt) {
        _views[0].handleSelection(evt.selectedItem, evt.selectedTile); 
    });

    AttachEventHandlers = function () {
        //Event Handlers
        //View click
        $('.pv-toolbarpanel-view').on('click', function (e) {
            var viewId = this.id.substring(this.id.lastIndexOf('-') + 1, this.id.length);
            if (viewId != null)
                SelectView(parseInt(viewId), false);
        });
        //Sort change
        $('.pv-toolbarpanel-sort').on('change', function (e) {
	    _currentSort = $('.pv-toolbarpanel-sort option:selected').attr('label');
            PivotViewer.Debug.Log('sort change _currentSort ' + _currentSort );
            FilterCollection(false);
        });
        //Facet sort
        $('.pv-filterpanel-accordion-facet-sort').on('click', function (e) {
            var sortDiv = $(this);
            var sortText = sortDiv.text();
            var facetName = sortDiv.parent().prev().children('a').text();
            var customSort = sortDiv.attr("customSort");
            if (sortText == "Sort: A-Z")
                $(this).text("Sort: Quantity");
            else if (sortText == "Sort: Quantity" && customSort == undefined)
                $(this).text("Sort: A-Z");
            else if (sortText == "Sort: Quantity")
                $(this).text("Sort: " + customSort);
            else
                $(this).text("Sort: A-Z");

            SortFacetItems(facetName);
        });
        //Facet item checkbox click
        $('.pv-facet-facetitem').on('click', function (e) {
            FacetItemClick(this);
        });
        //Facet item label click
        $('.pv-facet-facetitem-label').on('click', function (e) {
            var cb = $(this).prev();
            var checked = $(this.parentElement.parentElement).find(':checked');

            if (cb.prop('checked') == true && checked.length <= 1)
                cb.prop('checked', false);
            else
                cb.prop('checked', true);

            for (var i = checked.length - 1; i > -1; i -= 1) {
                if (checked[i].getAttribute('itemvalue') != cb[0].getAttribute('itemvalue'))
                    checked[i].checked = false;
            }
            FacetItemClick(cb[0]);
        });
        //Facet clear all click
        $('.pv-filterpanel-clearall').on('click', function (e) {
            //deselect all String Facets
            var checked = $('.pv-facet-facetitem:checked');
            for (var i = 0; i < checked.length; i++) {
                $(checked[i]).prop('checked', false);
                if ($(checked[i]).attr('itemvalue') == "CustomRange") 
                    HideCustomDateRange($(checked[i]).attr('itemfacet'));
            }
            //Reset all Numeric Facets
            var sliders = $('.pv-filterpanel-numericslider');
            for (var i = 0; i < sliders.length; i++) {
                var slider = $(sliders[i]);
                var thisMin = slider.slider('option', 'min'),
                    thisMax = slider.slider('option', 'max');
                slider.slider('values', 0, thisMin);
                slider.slider('values', 1, thisMax);
                slider.prev().prev().html('&nbsp;');
            }
            //Clear search box
            $('.pv-filterpanel-search').val('');
            //turn off clear buttons
            $('.pv-filterpanel-accordion-heading-clear').css('visibility', 'hidden');
            FilterCollection(false);
        });
        //Facet clear click
        $('.pv-filterpanel-accordion-heading-clear').on('click', function (e) {
            //Get facet type
            var facetType = this.attributes['facetType'].value;
	    if (facetType == "DateTime") {
                //get selected items in current group
                var checked = $(this.parentElement).next().find('.pv-facet-facetitem:checked');
                for (var i = 0; i < checked.length; i++) {
                    $(checked[i]).prop('checked', false);
                    HideCustomDateRange($(checked[i]).attr('itemfacet'));
                }
            } else if (facetType == "String") {
                //get selected items in current group
                var checked = $(this.parentElement).next().find('.pv-facet-facetitem:checked');
                for (var i = 0; i < checked.length; i++) {
                    $(checked[i]).prop('checked', false);
                }
            } else if (facetType == "Number") {
                //reset range
                var slider = $(this.parentElement).next().find('.pv-filterpanel-numericslider');
                var thisMin = slider.slider('option', 'min'),
                    thisMax = slider.slider('option', 'max');
                slider.slider('values', 0, thisMin);
                slider.slider('values', 1, thisMax);
                slider.prev().prev().html('&nbsp;');
            }
            FilterCollection(false);
            $(this).css('visibility', 'hidden');
        });
        //Numeric facet type slider drag
        $('.ui-slider-range').on('mousedown', function (e) {
            //drag it
        });
        //Datetime Facet Custom Range Text input changed
        $('.pv-facet-customrange').on('change', function (e) {
            CustomRangeChanged(this);
        });
        //Info panel
        $('.pv-infopanel-details').on('click', '.detail-item-value-filter', function (e) {
            $.publish("/PivotViewer/Views/Item/Filtered", [{ Facet: $(this).parent().children().attr('pv-detail-item-title'), Item: this.getAttribute('pv-detail-item-value'), Values: null, ClearFacetFilters: true }]);
            return false;
        });
        $('.pv-infopanel-details').on('click', '.pv-infopanel-detail-description-more', function (e) {
            var that = $(this);
            var details = $(this).prev();
            if (that.text() == "More") {
                details.css('height', '');
                $(this).text('Less');
            } else {
                details.css('height', '100px');
                $(this).text('More');
            }
        });
        $('.pv-infopanel-controls-navleft').on('click', function (e) {
          for (var i = 0; i < _filterItems.length; i++) {
              if (_filterItems[i].Id == _selectedItem.Id && _filterItems[i].Bucket == _selectedItemBkt){
                  if (i >= 0)
                      $.publish("/PivotViewer/Views/Item/Selected", [{id: _filterItems[i - 1].Id, bkt: _filterItems[i - 1].Bucket}]);
                      //jch need to move the images
                      if (_currentView == 0 || _currentView == 1) { 
                          for (var j = 0; j < _tiles.length; j++) {
                              if (_tiles[j].facetItem.Id == _filterItems[i - 1].Id) {
                                    _tiles[j].Selected(true);
                                    selectedCol = _views[_currentView].GetSelectedCol(_tiles[j], _filterItems[i - 1].Bucket);
                                    selectedRow = _views[_currentView].GetSelectedRow(_tiles[j], _filterItems[i - 1].Bucket);
                                    _views[_currentView].CentreOnSelectedTile(selectedCol, selectedRow);
                              } else {
                                    _tiles[j].Selected(false);
                              }
                          }
                      }
                  break;
              }
          }
        });
        $('.pv-infopanel-controls-navright').on('click', function (e) {
          for (var i = 0; i < _filterItems.length; i++) {
              if (_filterItems[i].Id == _selectedItem.Id && _filterItems[i].Bucket == _selectedItemBkt){
                  if (i < _filterItems.length) {
                      $.publish("/PivotViewer/Views/Item/Selected", [{id: _filterItems[i + 1].Id, bkt: _filterItems[i + 1].Bucket}]);
                      //jch need to move the images
                      if (_currentView == 0 || _currentView == 1) { 
                          for (var j = 0; j < _tiles.length; j++) {
                              if (_tiles[j].facetItem.Id == _filterItems[i + 1].Id) {
                                    _tiles[j].Selected(true);
                                    selectedCol = _views[_currentView].GetSelectedCol(_tiles[j], _filterItems[i + 1].Bucket);
                                    selectedRow = _views[_currentView].GetSelectedRow(_tiles[j], _filterItems[i + 1].Bucket);
                                    _views[_currentView].CentreOnSelectedTile(selectedCol, selectedRow);
                              } else {
                                    _tiles[j].Selected(false);
                              }
                          }
                      }
                  }
                  break;
              }
          }
        });
        //Search
        $('.pv-filterpanel-search').on('keyup', function (e) {
            var found = false;
            var foundAlready = [];
            var autocomplete = $('.pv-filterpanel-search-autocomplete');
            var filterRef = FilterCollection;
            var selectRef = SelectStringFacetItem;
            autocomplete.empty();

            //Esc
            if (e.keyCode == 27) {
                $(e.target).blur(); //remove focus
                return;
            }

            for (var i = 0, _iLen = _wordWheelItems.length; i < _iLen; i++) {
                var wwi = _wordWheelItems[i].Value.toLowerCase();
                if (wwi.indexOf(e.target.value.toLowerCase()) >= 0) {
                    if ($.inArray(wwi, foundAlready) == -1) {
                        foundAlready.push(wwi);
                        //Add to autocomplete
                        autocomplete.append('<span facet="' + _wordWheelItems[i].Facet + '">' + _wordWheelItems[i].Value + '</span>');

                        if (e.keyCode == 13) {
                            SelectStringFacetItem(
                                CleanName(_wordWheelItems[i].Facet),
                                CleanName(_wordWheelItems[i].Value)
                            );
                            found = true;
                        }
                    }
                }
            }

            $('.pv-filterpanel-search-autocomplete > span').on('mousedown', function (e) {
                e.preventDefault();
                $('.pv-filterpanel-search').val(e.target.textContent);
                $('.pv-filterpanel-search-autocomplete').hide();
                selectRef(
                    CleanName(e.target.attributes[0].value),
                    CleanName(e.target.textContent)
                );
                filterRef();
            });

            if (foundAlready.length > 0)
                autocomplete.show();

            if (found)
                FilterCollection(false);
        });
        $('.pv-filterpanel-search').on('blur', function (e) {
            e.target.value = '';
            $('.pv-filterpanel-search-autocomplete').hide();
        });
        //Shared canvas events
        var canvas = $('.pv-viewarea-canvas');
        //mouseup event - used to detect item selection, or drag end
        canvas.on('mouseup', function (evt) {
            var offset = $(this).offset();
            var offsetX = evt.clientX - offset.left;
            var offsetY = evt.clientY - offset.top;
            if (!_mouseMove || (_mouseMove.x == 0 && _mouseMove.y == 0))
                $.publish("/PivotViewer/Views/Canvas/Click", [{ x: offsetX, y: offsetY}]);
            _mouseDrag = null;
            _mouseMove = false;
        });
        //mouseout event
        canvas.on('mouseout', function (evt) {
            _mouseDrag = null;
            _mouseMove = false;
        });
        //mousedown - used to detect drag
        canvas.on('mousedown', function (evt) {
            var offset = $(this).offset();
            var offsetX = evt.clientX - offset.left;
            var offsetY = evt.clientY - offset.top;
            _mouseDrag = { x: offsetX, y: offsetY };
        });
        //mousemove - used to detect drag
        canvas.on('mousemove', function (evt) {
            var offset = $(this).offset();
            var offsetX = evt.clientX - offset.left;
            var offsetY = evt.clientY - offset.top;

            if (_mouseDrag == null)
                $.publish("/PivotViewer/Views/Canvas/Hover", [{ x: offsetX, y: offsetY}]);
            else {
                _mouseMove = { x: offsetX - _mouseDrag.x, y: offsetY - _mouseDrag.y };
                _mouseDrag = { x: offsetX, y: offsetY };
                $.publish("/PivotViewer/Views/Canvas/Drag", [_mouseMove]);
            }
        });
        //mousewheel - used for zoom
        canvas.on('mousewheel', function (evt, delta) {
            var offset = $(this).offset();
            var offsetX = evt.clientX - offset.left;
            var offsetY = evt.clientY - offset.top;
            //zoom easing different from filter
            _tileController.SetQuarticEasingOut();

            //Draw helper
            _tileController.DrawHelpers([{ x: offsetX, y: offsetY}]);

            var value = $('.pv-toolbarpanel-zoomslider').slider('option', 'value');
            if (delta > 0) { value = (value < 5 ) ? 5 : value + 5; }
            else if (delta < 0) { value = value - 5; }
 
            // Ensure that its limited between 0 and 20
            value = Math.max(0, Math.min(100, value));
            $('.pv-toolbarpanel-zoomslider').slider('option', 'value', value);
        });
        //http://stackoverflow.com/questions/6458571/javascript-zoom-and-rotate-using-gesturechange-and-gestureend
        canvas.on("touchstart", function (evt) {
            var orig = evt.originalEvent;

            var offset = $(this).offset();
            var offsetX = orig.touches[0].pageX - offset.left;
            var offsetY = orig.touches[0].pageY - offset.top;
            _mouseDrag = { x: offsetX, y: offsetY };
        });
        canvas.on("touchmove", function (evt) {
            try {
                var orig = evt.originalEvent;
                evt.preventDefault();

                //pinch
                if (orig.touches.length > 1) {
                    evt.preventDefault();
                    //Get centre of pinch
                    var minX = 10000000, minY = 10000000;
                    var maxX = 0, maxY = 0;
                    var helpers = [];
                    for (var i = 0; i < orig.touches.length; i++) {
                        helpers.push({ x: orig.touches[i].pageX, y: orig.touches[i].pageY });
                        if (orig.touches[i].pageX < minX)
                            minX = orig.touches[i].pageX;
                        if (orig.touches[i].pageX > maxX)
                            maxX = orig.touches[i].pageX;
                        if (orig.touches[i].pageY < minY)
                            minY = orig.touches[i].pageY;
                        if (orig.touches[i].pageY > maxY)
                            maxY = orig.touches[i].pageY;
                    }
                    var avgX = (minX + maxX) / 2;
                    var avgY = (minY + maxY) / 2;
                    //var delta = orig.scale < 1 ? -1 : 1;
                    _tileController.SetLinearEasingBoth();

                    helpers.push({ x: avgX, y: avgY });
                    _tileController.DrawHelpers(helpers);
                    _tileController.DrawHelperText("Scale: " + orig.scale);
                    $.publish("/PivotViewer/Views/Canvas/Zoom", [{ x: avgX, y: avgY, scale: orig.scale}]);
                    //$.publish("/PivotViewer/Views/Canvas/Zoom", [{ x: avgX, y: avgY, delta: orig.scale - 1}]);
                    return;
                } else {
                    var offset = $(this).offset();
                    var offsetX = orig.touches[0].pageX - offset.left;
                    var offsetY = orig.touches[0].pageY - offset.top;

                    _mouseMove = { x: offsetX - _mouseDrag.x, y: offsetY - _mouseDrag.y };
                    _mouseDrag = { x: offsetX, y: offsetY };
                    $.publish("/PivotViewer/Views/Canvas/Drag", [_mouseMove]);
                }
            }
            catch (err) { PivotViewer.Debug.Log(err.message); }
        });
        canvas.on("touchend", function (evt) {
            var orig = evt.originalEvent;
            //Item selected
            if (orig.touches.length == 1 && _mouseDrag == null) {
                var offset = $(this).offset();
                var offsetX = orig.touches[0].pageX - offset.left;
                var offsetY = orig.touches[0].pageY - offset.top;
                if (!_mouseMove || (_mouseMove.x == 0 && _mouseMove.y == 0))
                    $.publish("/PivotViewer/Views/Canvas/Click", [{ x: offsetX, y: offsetY}]);
            }
            _mouseDrag = null;
            _mouseMove = false;
            return;
        });
    };

    FacetItemClick = function (checkbox) {
        if ($(checkbox).prop('checked') == true) {
            $(checkbox.parentElement.parentElement.parentElement).prev().find('.pv-filterpanel-accordion-heading-clear').css('visibility', 'visible');
            if ($(checkbox).attr('itemvalue') == "CustomRange"){
                GetCustomDateRange($(checkbox).attr('itemfacet'));
                return;
            }
        } else if ($(checkbox).prop('checked') == false && $(checkbox).attr('itemvalue') == "CustomRange")
                HideCustomDateRange($(checkbox).attr('itemfacet'));
        FilterCollection(false);
    };

    FacetSliderDrag = function (slider, min, max) {
        var thisWrapped = $(slider);
        var thisMin = thisWrapped.slider('option', 'min'),
                    thisMax = thisWrapped.slider('option', 'max');
        // Treat no info as like 0 (bit dodgy fix later)
        if (min == "(no info)") min = 0;
        if (min > thisMin || max < thisMax) {
            thisWrapped.parent().find('.pv-filterpanel-numericslider-range-val').text(min + " - " + max);
            thisWrapped.slider('values', 0, min);
            thisWrapped.slider('values', 1, max);
            thisWrapped.parent().parent().prev().find('.pv-filterpanel-accordion-heading-clear').css('visibility', 'visible');
        }
        else if (min == thisMin && max == thisMax)
            thisWrapped.parent().parent().prev().find('.pv-filterpanel-accordion-heading-clear').css('visibility', 'hidden');
        FilterCollection(false);
    };

    Bucketize = function (bucketName, valueArray, itemId, bucketStartDate) {
        var found = false;

        if (valueArray.length == 0) {
            var datetimeinfo = new PivotViewer.Models.DateTimeInfo(bucketName, bucketStartDate);
            valueArray[0] = datetimeinfo;
            valueArray[0].Items.push(itemId);
        } else { 
            for (var d = 0; d < valueArray.length; d++) {
                if (valueArray[d].Name == bucketName) { 
                    valueArray[d].Items.push(itemId);
                    found = true;
                }
            }
            if (!found) {
                    var datetimeinfo = new PivotViewer.Models.DateTimeInfo(bucketName, bucketStartDate);
                    datetimeinfo.Items.push(itemId);
                    valueArray.push(datetimeinfo);
            }
        }
    };

    CreateDatetimeBuckets = function () {
        var months = new Array(12);
        months[0] = "January";
        months[1] = "February";
        months[2] = "March";
        months[3] = "April";
        months[4] = "May";
        months[5] = "June";
        months[6] = "July";
        months[7] = "August";
        months[8] = "September";
        months[9] = "October";
        months[10] = "November";
        months[11] = "December";

        //Find the datetime facets
        for (var i = 0; i < PivotCollection.FacetCategories.length; i++) {
            var currentFacetCategory = PivotCollection.FacetCategories[i];

            // If facet category is a datetime then sort the items into buckets
            if (currentFacetCategory.Type == PivotViewer.Models.FacetType.DateTime) {
                for (var j = 0; j < PivotCollection.Items.length; j++) {
                   var value;
                   var currentItem = PivotCollection.Items[j];
                   for (var k = 0; k < currentItem.Facets.length; k++) {
                       if (currentItem.Facets[k].Name == currentFacetCategory.Name) {
                           value = currentItem.Facets[k].FacetValues[0];
                           var dateValue = new Date(value.Value);
                       
                           // get date and time parts...
                           var year = dateValue.getFullYear();
                           Bucketize (year, currentFacetCategory.yearBuckets, currentItem.Id, new Date(year, 0, 0)); 
                   
                           var decade = year - (year % 10);
                           Bucketize (decade + "s", currentFacetCategory.decadeBuckets, currentItem.Id, new Date(year, 0, 0)); 
                   
                           var month = dateValue.getMonth();
                           Bucketize (months[month] + ", " +  year, currentFacetCategory.monthBuckets, currentItem.Id, new Date(year, month, 0)); 
                   
                           var day = dateValue.getDate();
                           Bucketize (months[month] + " " + day + ", " +  year, currentFacetCategory.dayBuckets, currentItem.Id, new Date(year, month, day)); 
                   
                           var hours = dateValue.getHours();
                           var hourname = (hours > 12) ? hours - 12 + " pm" : hours + " am";
                           Bucketize (months[month] + " " + day + ", " +  year + " " + hourname, currentFacetCategory.hourBuckets, currentItem.Id, new Date(year, month, day, hours, 0, 0)); 
                   
                           var mins = dateValue.getMinutes();
                           Bucketize (months[month] + " " + day + ", " +  year + " " + hours + ":" + mins, currentFacetCategory.minuteBuckets, currentItem.Id, new Date(year, month, day, hours, mins, 0)); 
                   
                           var secs = dateValue.getSeconds();
                           Bucketize (months[month] + " " + day + ", " +  year + " " + hours + ":" + mins + ":" + secs, currentFacetCategory.secondBuckets, currentItem.Id, new Date(year, month, day, hours, mins, secs)); 

                           break;
                       }
                   }
                }
            }
            currentFacetCategory.decadeBuckets.sort(function (a, b) {return a.StartDate - b.StartDate});
            currentFacetCategory.yearBuckets.sort(function (a, b) {return a.StartDate - b.StartDate});
            currentFacetCategory.monthBuckets.sort(function (a, b) {return a.StartDate - b.StartDate});
            currentFacetCategory.dayBuckets.sort(function (a, b) {return a.StartDate - b.StartDate});
            currentFacetCategory.hourBuckets.sort(function (a, b) {return a.StartDate - b.StartDate});
            currentFacetCategory.minuteBuckets.sort(function (a, b) {return a.StartDate - b.StartDate});
            currentFacetCategory.secondBuckets.sort(function (a, b) {return a.StartDate - b.StartDate});
        }
    };

    HideCustomDateRange = function (facetName) {
        $('#pv-custom-range-' + facetName + '__Start').css('visibility', 'hidden'); 
        $('#pv-custom-range-' + facetName + '__Finish').css('visibility', 'hidden'); 
        $('#pv-custom-range-' + facetName + '__StartDate').datepicker("setDate", null);
        $('#pv-custom-range-' + facetName + '__FinishDate').datepicker("setDate", null);
        $('#pv-custom-range-' + facetName + '__FinishDate').datepicker("option", "minDate", null);
        $('#pv-custom-range-' + facetName + '__StartDate').datepicker("option", "minDate", null);
        $('#pv-custom-range-' + facetName + '__FinishDate').datepicker("option", "maxDate", null);
        $('#pv-custom-range-' + facetName + '__StartDate').datepicker("option", "maxDate", null);
    };

    GetCustomDateRange = function (facetName) {
        var facet = _nameMapping[facetName];
        var category = PivotCollection.GetFacetCategoryByName(facet);
        var maxYear, minYear;
        var maxDate, minDate;
        $('#pv-custom-range-' + facetName + '__Start').css('visibility', 'visible'); 
        $('#pv-custom-range-' + facetName + '__Finish').css('visibility', 'visible'); 
        $('#pv-custom-range-' + facetName + '__StartDate').datepicker({
            showOn: 'button',
            changeMonth: true,
            changeYear: true,
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: 'http://jqueryui.com/resources/demos/datepicker/images/calendar.gif'
        });
        $('#pv-custom-range-' + facetName + '__FinishDate').datepicker({
            showOn: 'button',
            changeMonth: true,
            changeYear: true,
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: 'http://jqueryui.com/resources/demos/datepicker/images/calendar.gif'
        });
        if (category.dayBuckets.length > 0){
           maxDate = category.dayBuckets[category.dayBuckets.length - 1].StartDate;
           minDate = category.dayBuckets[0].StartDate;
           $('#pv-custom-range-' + facetName + '__StartDate').datepicker( "option", "defaultDate", minDate );
           $('#pv-custom-range-' + facetName + '__FinishDate').datepicker( "option", "defaultDate", maxDate );
           if (category.yearBuckets.length > 0){
               maxYear = category.yearBuckets[category.yearBuckets.length - 1].Name;
               minYear = category.yearBuckets[0].Name;
               $('#pv-custom-range-' + facetName + '__StartDate').datepicker( "option", "yearRange", minYear + ':' + maxYear );
               $('#pv-custom-range-' + facetName + '__FinishDate').datepicker( "option", "yearRange", minYear + ':' + maxYear );
            }
        }
    };

    CustomRangeChanged = function (textbox) {
        var start;        
        var end;
        if ($(textbox).attr('itemvalue') == "CustomRangeStart") {
            // Check we have value for matching end
            start = $(textbox)[0].value;
            end = $('#pv-custom-range-' + $(textbox).attr('itemfacet') + '__FinishDate')[0].value;
            if (end == "")
                $('#pv-custom-range-' + $(textbox).attr('itemfacet') + '__FinishDate').datepicker("option", "minDate", new Date(start));
        } else if ($(textbox).attr('itemvalue') == "CustomRangeFinish") {
            // Check we have value for matching start
            end = $(textbox)[0].value;
            start = $('#pv-custom-range-' + $(textbox).attr('itemfacet') + '__StartDate')[0].value;
            if (start == "")
                $('#pv-custom-range-' + $(textbox).attr('itemfacet') + '__StartDate').datepicker("option", "maxDate", new Date(end));
        }
        if (start && end) {
            // Clear any filters already set for this facet
            var checked = $(textbox.parentElement.parentElement.parentElement.parentElement.children).next().find('.pv-facet-facetitem:checked');
            for (var i = 0; i < checked.length; i++) {
                if ($(checked[i]).attr('itemvalue') != 'CustomRange')
                    $(checked[i]).prop('checked', false);
            }
            FilterCollection(false);
        }
    };

    //Constructor
    $.fn.PivotViewer = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.PivotViewer');
        }
    };
})(jQuery);
