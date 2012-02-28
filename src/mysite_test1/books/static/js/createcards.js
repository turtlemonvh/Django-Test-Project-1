/* Application for creating cards in the first step of the 7 Management and Planning Tools
 * 
 * Avoided using backbone because d3 makes using this annoying.  Data is owned by d3, so it isn't directly tied to a dom model.
 * 
 * SPECS:
 * - certain actions will call a re-draw of d3
 * - data from svg should be in sync with a model for the page
 * - data is stored as JSON and kept in sync with server asynchronously, called periodically or on request
 * 
 */

// Load the application once the DOM is ready, using `jQuery.ready`:

//$(function(){

	// Define Constants
	//------------------
	var card_width = 10;
	var card_height = 6;
	var dropHEIGHT = 500;
	var dropWIDTH = dropHEIGHT * 2;
	var cardSizeMulti = 8; // how much smaller are the cards on the svg
	var cardRoundedFactor = 0.02;
	var card_vis;
	var max_text_size = 40;

	// Card Model
	// ----------
	function Card(name,x,y) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.onCanvas = CheckPosition;
		
		// Returns false if off the svg, true otherwise
		function CheckPosition(){
			if( x < 0 || y < 0) {
				console.log("off to left or top");
				return false;
			} else if ( x > dropWIDTH || y > dropHEIGHT) {
				console.log("off to bottom or right");
				return false;
			}
			return true;
		}
	}
  
	// Card Session Model
	// ------------------
	
	/*
	 * Add function to draw with d3
	 * 
	 */
	
	function CardSession(id) {
		// Variables
		var session = id;
		var Cards = {};
		
		// Functions
		this.getSession = getSession;
		this.numCards = numCards;
		this.addCard = addCard;
		this.getCards = getCards;
		this.deleteCard = deleteCard;		
		this.initialize = initialize;
		this.save = pushToServer;
		
		// Return sesion
		function getSession() {
			return session;
		}
		
		// Return number of cards
		function numCards() {
			var size = 0;
			_.each(Cards, function() {
				size++;
			})
			return size;
		}
		
		// Add a card
		function addCard( name, x, y) {
			var id = numCards();
			var ncard = new Card( name, x, y );
			console.log("New card: " + ncard);
			Cards[id] = ( ncard );
			return;
		}
		
		// Dump card object array
		function getCards() {
			return Cards;
		}
		
		
		function deleteCard(id) {
			if( Cards[id]){
				delete Cards[id];
				return reorder();
			} else {
				return false;
			}
		}
		
		// Reorder cards; called when one is deleted
		function reorder() {
			var nCards = {};
			var itr = 0;
			_.each(Cards, function(val,key) {
				console.log(val);
				nCards[itr] = val;
				itr++;
			})
			Cards = nCards;
			return true;
		}
		
		/*
		 *  Get values from server
		 *   This function completely replaces whatever data is currently stores in the object
		 */		
		function initialize() {
			// Get session data from server
			$.ajax({
			    type: 'GET',
			    url: "/seventools/cardsession/json/",
			    dataType: 'json',
			    success: function(data){saveCards(data)},
			    data: { id: session}
			});
			
			// Iterate and store as current session data
			function saveCards(data) {
				var nCards = {};
				$.each(data, function(key,val) {
					var card = val.fields;
					var nCard = new Card( card.name, card.x_coord, card.y_coord);
					nCards[key] = nCard;
				})
				Cards = nCards;
			}
		}
		
		/*
		 * Get position data from the current d3 plot 
		 */
		function syncWithD3() {
			var allCards = $(".svg_card");
			var nCards = {};
			var nextCard = new Card();
			// Create cards and add to temp object
			allCards.each(function(k,v){
				nextCard.name = v.__data__.name;
				nextCard.x = v.__data__.x;
				nextCard.y = v.__data__.y;
				
				nCards[k] = nextCard;
			})
			// Replace all card data
			Cards = nCards;
		}
		
		// Send all data to sever to save
		// First, create JSON serializer for cardsession
		// Then, send this via POST
		function pushToServer() {
			// Serialize??
			// http://ask.metafilter.com/154077/How-do-I-read-a-JSON-object-in-Python
			$.ajax({
		        url: "/seventools/cardsession/saveallcards/",
		        type: 'POST',
		        contentType: 'application/json; charset=utf-8',
		        data: JSON.stringify({session: session, cards: Cards}),
		        dataType: 'text',
		        success: function(result) {
		        	console.log(result);
		            console.log(result.Result);
		        }
		    });
						
		}
		
		

	}
	
	/*
	 * UTILITY FUNCTIONS
	 * 
	 * Miscellaneous functions used for this page.
	 * 
	 */
	
	// Change the name of the card
	function changeCardName(cname, ccard) {
		// Change to provide validation; no empty name (no action taken)
		var name = prompt("Please enter a new name",cname);
		if (name!=null && name!="")
		{
			// change name
			text = splitString(name, 12);
			nlines = text.length;
			$($(ccard).find("text")[0]).text(text[0]);
			$($(ccard).find("text")[1]).text(text[1]);
			$($(ccard).find("text")[2]).text(text[2]);
			console.log("Card name changed");
		} else {
			// Nothing
			console.log("Card name not changed");
		}
	}	
	
	
	// Split string into equal sized parts
	// Maxlength denotes the # chars after which a new word should not be started
	function splitString(s, maxlength){
		// The length of the string
		var s_array = new Array();
		var total_length = s.split("").length;
		if(total_length < maxlength){
			s_array[0] = (s);
			return s_array;
		} else {
			// return array
			var c_string = "";
			var c_length = 0;
			var array_l = 0;
			$(s.split(" ")).each(function(){
				c_length += this.split("").length;
				c_string += this + " ";
				if(c_string.split("").length > maxlength){
					s_array[array_l] = $.trim(c_string);
					c_string = "";
					c_length = 0;
					array_l++;
				}
			})
			if(c_string.split("").length > 0){
				s_array[array_l] = c_string;				
			}
			return s_array;
		}
	}	


//});
