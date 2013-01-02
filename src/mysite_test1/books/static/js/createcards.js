/* Application for creating cards in the first step of the 7 Management and Planning Tools
 * 
 * Avoided using backbone because d3 makes using this annoying.  Data is owned by d3, so it isn't directly tied to a dom model.
 * 
 * USE:
 * - Load on $(document).ready using "cardsession.startapp();"
 * 
 * SPECS:
 * - certain actions will call a re-draw of d3
 * - data from svg should be in sync with a model for the page
 * - data is stored as JSON and kept in sync with server asynchronously, called periodically or on request
 * 
 * 
 * REFACTOR
 * - link D3 data and current_session
 * 		- provide callbacks on remove, enter, and change functions in d3
 * 		- d3 needs and acts on an array
 * 		- I need an object
 * 			- how to make these work together so d3 directly changes datamodel
 * 			- maybe keep d3 data in a separate container and sync these??
 * - check for uniqueness when adding a new card
 * - provide option to save changes when:
 * 		- leaving page
 * 		- changing session via drop down box
 * - make sure only 2 methods contact server
 * 		- dump of cardsession to server
 * 		- pulling cardsession into view
 * 
 * BUGS
 * - when multiples are dropped, cards are shown moving to the right but stay where they are
 * - when dropping, a jQuery error is thrown
 * 
 */
var cardsession = function(){

	// Define Constants
	//------------------	
	var config = {
		card_width: 10,
		card_height: 6,
		dropHEIGHT: 500,
		dropWIDTH: 1000,
		cardSizeMulti: 8, // how much smaller are the cards on the svg
		cardRoundedFactor: 0.02,
		max_text_size: 40
	}
	
	// Data store for current session
	// Initialize with session_id of 0 and change on initialize()
	var current_session = new CardSession(0);

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
	function CardSession(id) {
		// Variables
		var session = id;
		var Cards = {};
		
		/*
		 * Functions
		 */ 
		this.getSession = getSession;
		this.numCards = numCards;
		this.getCards = getCards;

		// Functions acting on a card at a time
		this.addCard = addCard;		
		this.deleteCard = deleteCard;
		this.setCoords = setCoords;
		
		// Housekeeping
		this.initialize = initialize; // overwrites current object with data from server
		this.sync = syncWithD3; // pulls data from D3 into model
		this.save = pushToServer;
		this.update_SVG = update_SVG; // re-draw
		
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
		
		// Delete a single card by id
		function deleteCard(id) {
			if( Cards[id]){
				delete Cards[id];
				return reorder();
			} else {
				return false;
			}
		}
		
		// Delete a single card by id
		function setCoords( id, x, y) {
			if( Cards[id]){
				Cards[id].x = x;
				Cards[id].y = y;
				return true;
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
		 * 
		 *   This function completely replaces whatever data is currently stored in the local object
		 */		
		function initialize() {
			console.log("start cardsession.initilize")
			
			// set session not that document is ready
			session = $("#session_select :selected").val();
			
			// Get session data from server
			$.ajax({
			    type: 'GET',
			    url: "/seventools/cardsession/json/",
			    dataType: 'json',
			    success: function(data){updateCards(data)},
			    data: { id: session}
			});
			
			// Iterate and store as current session data
			function updateCards(data) {
				var nCards = {};
				$.each(data, function(key,val) {
					var card = val.fields;
					var nCard = new Card( card.name, card.x_coord, card.y_coord);
					nCards[key] = nCard;
				})
				Cards = nCards;
				update_SVG(); // redraw
				console.log(getCards()); // dump to console
			}
			
			console.log("end cardsession.initilize")
		}
		
		// Send all data to sever to save
		function pushToServer() {
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
		
		/*
		 * Get position data from the current d3 plot
		 */
		function syncWithD3() {
			var allCards = $(".svg_card");
			var nCards = {};
			// Create cards and add to temp object
			allCards.each(function(k,v){
				var nextCard = new Card();
				var text = $(v).find("text");
				
				// Add together text
				// text[0].textContent
				
				nextCard.name = v.__data__.name;
				nextCard.x = v.__data__.x;
				nextCard.y = v.__data__.y;
				
				console.log(nextCard)
				// This doesn't work
				// The __data__ array isn't updated when values change
				// Have to add functions to keep d3 up to date and just periodically re-draw (like when a card is deleted)
				
				nCards[k] = nextCard;
			})
			// Replace all card data
			Cards = nCards;
		}
		
		// Return as an array of cards with ids for use in d3
		function CardsArray() {
			var c_arr = [];
			$.each(Cards, function(key,val) {
				var ncard = {
					id: key,
					x: (val.x * config.dropWIDTH),
					y: (val.y * config.dropHEIGHT),
					name: val.name
				}
				c_arr.push (ncard);
			})
			
			return c_arr;
		}
		
		// Redraw cards
		function update_SVG() {
			console.log("start update svg")
			
			// Collect data
			var all_card_data = CardsArray();
			
			// Add a container for each card
			var card_disp = body.selectAll("g")
			    .data(all_card_data, function(d) { return d.name; }); // sort by output order from django data model
			   
			// Identify the entering nodes with their own variable
		   	var card_disp_enter = card_disp.enter().append("g")
		      	.attr("class","svg_card")
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }) // transform to x and y for card
				.attr("font-size",config.card_width*config.cardSizeMulti/9)
				.on("click", selectSvgCard)
				.on("dblclick", function(d){ changeCardName(d.name, this)})
				.call(d3.behavior.drag()
		            .on("drag", drag)
		         )
	
			// Add rectangle
			card_disp_enter.append("rect")
				.attr("x", 1)
		      	.attr("y",1)
				.attr("width", config.card_width*config.cardSizeMulti)
				.attr("height", config.card_height*config.cardSizeMulti)
				.attr("rx", config.card_width*config.cardRoundedFactor)
				.attr("ry", config.card_height*config.cardRoundedFactor)
	
			// Add and position text
			// 3 text elements are used to wrap 3 lines
			var nlines = 1;
			var cardMiddleWidth = config.card_width*config.cardSizeMulti/2;
			var cardMiddleHeight = config.card_height*config.cardSizeMulti/2;
			var line_spacing = 10;
			card_disp_enter.append("text")
				.attr("x", cardMiddleWidth)
				.attr("text-anchor", "middle")
				.text(function (d) { text = splitString(d.name, 12); nlines = text.length; return text[0]; })
				.attr("y", cardMiddleHeight - line_spacing/2*(nlines-1))
			
			// Subsequent text boxes can return array values that don't existi with no error
			card_disp_enter.append("text")
				.attr("x", cardMiddleWidth)
				.attr("text-anchor", "middle")
				.text(function (d) { text = splitString(d.name, 12); nlines = text.length; return text[1]; })
				.attr("y", cardMiddleHeight + line_spacing  - line_spacing/2*(nlines-1))
				
			card_disp_enter.append("text")
				.attr("x", cardMiddleWidth)
				.attr("text-anchor", "middle")
				.text(function (d) { text = splitString(d.name, 12); nlines = text.length; return text[2]; })			
				.attr("y", cardMiddleHeight + 2*line_spacing - line_spacing/2*(nlines-1))
				
			// Transition and exit
			card_disp.transition().duration(0)
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; }); // transform to x and y for card
			
			// Not getting red of old cards
			card_disp.exit()
				.transition().duration(500)
				.attr("transform", function(d) { return "translate(" + -config.card_width*config.cardSizeMulti + "," + d.y + ")"; })
					.remove ();
			
			// Update table display too
			// updateSessionTable(all_card_data);
			
			console.log("end update svg")
		}		

	}
	
	/*
	 * Called when document.ready
	 * 
	 * Initizlizes app
	 */
	function startapp(){
		// Initialize the drop area
		$( "#droppable" ).droppable();			
		
		// Move a card from the queue into the drop area
		$( "#droppable" ).bind( "drop", function(event, ui) {

			console.log("card was dropped on canvas");
			
			// Determine position of dropped card on drop area
			var toffset = $(this).offset();
			var w = $(this).width();
			var h = $(this).height();			
			var w_rel = (ui.draggable.offset().left - toffset.left)/config.dropWIDTH;
			var h_rel = (ui.draggable.offset().top - toffset.top)/config.dropHEIGHT;

     		var card_name = ui.draggable.parents("tr").find("textarea").val();
     		current_session.addCard( card_name, w_rel, h_rel);
     		current_session.update_SVG();
     		ui.draggable.parents("tr").remove();
		});		
		
		// Create a new card with the form
		$("#name_input").submit(function(){
			var card = $('#new_card').val();
			addCardToQueue(card);		
			$(this).find(':text').val(''); // reset form to avoid duplicates
		})
		
		// Respond to changes in the session
		// Cards in queue are lost
		// Nothing is saved
		$("#session_select :input").change(function(){
			current_session.initialize();
		})
		
		// Set up the svg canvas
		card_vis = d3.select("#droppable").append("svg") // this is an svg
			.attr("width",config.dropWIDTH)
			.attr("height",config.dropHEIGHT)
			.attr("class","card_visualisation")
		
		// Add a g element to contain the cards and allow relatove movement
		body = card_vis.append("g")
			.attr("transform", "translate(0,0)");
				
		// Initialize the current session
		current_session.initialize();
	}
	
	/*
	 * UTILITY FUNCTIONS
	 * 
	 * Miscellaneous functions used for this page.
	 * 
	 */	
	
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
	
	
	// Create a new card by passing the new name
	function addCardToQueue(card){
		console.log('new card name: ' + card);

		// Position the new card
		var spacing = $(".draggable").outerHeight(true); // spcaing between cards in px, same for all cards
		
		// Move all the cards down
		$(".undropped_card").each(function(){
			var o_offset = $(this).offset();
			$(this).offset({ top: o_offset.top + spacing, left: o_offset.left})
		})
		
		// Create new card and prepend to list	
		// Use underscore templates to clean this up
		var ncard = '<tr><td><textarea>' + card + '</textarea></td><td><div class="draggable ui-widget-content undropped_card shadow"></div></td></tr>';
		var added = $(ncard).prependTo($('#cards_container'));
		added.find("div").draggable({ revert: "invalid" });
		
		// Realign
		// This doesn't seem to be working here like it does in the command line
		$('#cards_container div').each(function(k,v){v.style.top = 0});
												
		console.log("n_undropped = " + $(".undropped_card").length)
	}
	
	// Get all JSON data for current session into table
	function updateSessionTable(data) {
		// Use the data already collected for svg
		// format: {id, x, y, name} as {id, x, y, name}
		var str = "<tr>";
		//str += "<th>Card Name</th><th>x coord</th><th>y coord</th>";
		str += "<th>id</th><th>Card Name</th><th>x coord</th><th>y coord</th>";
		str += "</tr>";
		$.each(data, function(key,val) {
			str += "<tr><td>" + val.id + "</td><td>" + val.name + "</td><td>" + (val.x) + "</td><td>" + (val.y)+ "</td></tr>";
		})
		$("#dropped_cards").html(str);
	}	
	
	/*
	 * Visualization utilities
	 */
	function selectSvgCard () {
		var test_class = 'clicked_svg_card';

		// Toggles class
		if ($(this).hasClass(test_class)) {
			// Split class data
			console.log(this);
			$(this).removeClass(test_class);
			console.log(this);
			console.log("Card de-selected");
		} else {
			console.log(this);
			$(this).addClass(test_class);
			console.log(this);
			console.log("Card selected");
		}
	}
	
	// Function to call on svg drag
	// change to drag regardless of class, but all move
	// check position at end
	// https://github.com/mbostock/d3/wiki/Drag-Behavior#wiki-on
	function drag(d,i){
		var test_class = 'clicked_svg_card';
		$(this).addClass(test_class);
		
		// Adjust data
		d.x += d3.event.dx;
		d.y += d3.event.dy;
		
		// Check to see if its gone off the page
		// Change to make drag to right a pure delete
		// To remove, update data model then refresh d3
		if( d.x < 0 || d.y < 0) {
			console.log("off to left or top");
			addCardToQueue(d.name);
			// Remove card from model and redraw
		} else if ( d.x > config.dropWIDTH || d.y > config.dropHEIGHT) {
			console.log("off to bottom or right");
			addCardToQueue(d.name);
		}
		
		// Move it
		d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
    }
    
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
			console.log(cs.getCards());
			cs.sync();
			console.log("Card model changed");
			console.log(cs.getCards());
		} else {
			// Nothing
			console.log("Card name not changed");
		}
	}
	
	/*
	 * Publically accessible data
	 */
	return {
		startapp: startapp,
		splitString: splitString,
		CardSession: CardSession,
		current_session: current_session
	}

}();
