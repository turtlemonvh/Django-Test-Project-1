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
	function Card(id,name,x,y) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.name = name;
		this.onCanvas = CheckPosition;
		
		// Returns false if off the svg, true otherwise
		function CheckPosition(){
			return true;
		}
	}
  
	// Card Session Model
	// ------------------
	
	/*
	 * Add function to draw with d3
	 * 
	 */
	
	function CardSession() {
		this.Cards = [];
		this.addCard = addCard(name,x,y);
		this.numCards = countCards;
		
		function addCard(name, x, y){
			var id = this.Cards.length + 1;
			var card = new Card(id, name, x, y);
			this.Cards.push(card);			
		}
		
		function countCards(){
			return this.Cards.length;
		}
	}



//});
