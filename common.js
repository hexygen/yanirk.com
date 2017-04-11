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
    
    function embed_player()
    {
        var s1 = new SWFObject('player.swf','player','720','405','5');
        s1.addParam('allowfullscreen','true');
        s1.addParam('allowscriptaccess','always');
        s1.addParam('flashvars','&file=https://dl.dropboxusercontent.com/u/640943/Site/Videos/YanirKleiman_DemoReel_2011.flv&controlbar=over&icons=false&image=https://dl.dropboxusercontent.com/u/640943/Site/Videos/LastFrame.jpg&plugins=gapro-1&gapro.accountid=UA-9716104-1');
        s1.write('divMovieBox');

        // if there is no flash this code will show the "no flash" message:
        var noFlash = document.getElementById("divFlashVersion");
        if (noFlash != null)
        {
           noFlash.style.visibility = "visible";
        }
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
