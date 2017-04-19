/*
    Common functions used in all pages in yanirk.com.
*/

    function show_popup()
    {
       var popup = document.getElementById("divPopup");
       popup.style.display = "block";
    }

    function hide_popup()
    {
       var popup = document.getElementById("divPopup");
       popup.style.display = "none";
    }

    function GetViewportHeight()
    {
         var viewportheight;

         // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight

         if (typeof window.innerHeight != 'undefined')
         {
              viewportheight = window.innerHeight;
         }
         
        // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
        
         else if (typeof document.documentElement != 'undefined'
             && typeof document.documentElement.clientHeight !=
             'undefined' && document.documentElement.clientHeight != 0)
         {
               viewportheight = document.documentElement.clientHeight;
         }
         
         // older versions of IE
         
         else
         {
               viewportheight = document.getElementsByTagName('body')[0].clientHeight;
         }
    
         return viewportheight;    
    }

    function resize_me()
    {
        var total_height = GetViewportHeight();
        
        var margin_top = (total_height - 700) / 2;
        if (margin_top < -5)
           margin_top = -5;
        if (margin_top > 50)
           margin_top = 50;
        
        var divPage = document.getElementById("divPage");

        if (divPage != null)
        {
            divPage.style.marginTop = margin_top + 'px';
        }
        
    }

    //resize_me();
