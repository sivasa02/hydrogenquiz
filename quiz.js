
document.addEventListener('DOMContentLoaded', function() {
  /* Must be two. */
  var teams = ['Team 1', 'Team 3','Team 2','Team 5','Team 6','Team 4','Team 4'];

  var strTie = 'Tie';
  var strClose = 'Close';

  /***********************************************/
  /* No need to configure anything further down. */
  /***********************************************/

  var NS = 'http://www.w3.org/1999/xhtml';
  var D = document;

  /* Get categories and questions from DOM. */
  var categories = (function() {
    var ret = [], questions = null, question = null;
    var el = D.getElementById('questions').firstChild;
    for (; el !== null; el = el.nextSibling) {
      if (el.nodeType !== 1) {
        continue;
      }

      if (el.nodeName.toLowerCase() === 'h2') {
        questions = [];
        question = null;
        ret.push({
          title: el.textContent,
          questions: questions,
        });
        continue;
      }

      if (questions === null) {
        continue;
      }

      if (el.nodeName.toLowerCase() === 'p') {
        var e = D.createElementNS(NS, 'div');
        el.parentNode.replaceChild(e, el);
        e.appendChild(el);
        el = e;
      } else if (el.nodeName.toLowerCase() !== 'div') {
        continue;
      }

      if (question === null) {
        el.className = 'q';
        question = el;
      } else {
        el.className = 'a';
        questions.push([question, el]);
        question = null;
      }
    }
    return ret;
  })();

  /* Scores will be saved here. */
  var scores = [];


  /* Helper functions */

  var nukeChildren = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };

  var addText = function(el, text) {
    el.appendChild(D.createTextNode(text));
  };

  var addNewElement = function(parent, el, opt_text) {
    var el = D.createElementNS(NS, el);
    parent.appendChild(el);
    if (opt_text) {
      addText(el, opt_text);
    }
    return el;
  };

  var addNewClass = function(el, class_name){
    el.className += " " + class_name;
  }

  /* Create the question board. */

  var mDiv, linksList, xLink, tieLink, team0Link, team1link, team3link,team4link,team5link, closeLink;

  (function() {
    mDiv = addNewElement(D.getElementsByTagName('body')[0], 'div');
    mDiv.id = 'm';

    var div = addNewElement(addNewElement(mDiv, 'div'), 'div');

    xLink = addNewElement(div, 'a', 'x');
    xLink.id = 'x';

    linksList = addNewElement(div, 'ul');
    linksList.id = 'links';
    team0Link = addNewElement(addNewElement(linksList, 'li'), 'button', teams[0]);
    tieLink   = addNewElement(addNewElement(linksList, 'li'), 'button', strTie);
    team1Link = addNewElement(addNewElement(linksList, 'li'), 'button', teams[1]);
    team3Link = addNewElement(addNewElement(linksList, 'li'), 'button', teams[3]);
    team5Link = addNewElement(addNewElement(linksList, 'li'), 'button', teams[5]);
    team4Link = addNewElement(addNewElement(linksList, 'li'), 'button', teams[4]);


   
    addNewClass(team0Link, 'btn_select');
    addNewClass(tieLink, 'btn_select btn_blue_light');
    addNewClass(team1Link, 'btn_select');
    addNewClass(team3Link, 'btn_select');
    addNewClass(team5Link, 'btn_select');
    addNewClass(team4Link, 'btn_select'); 
    
  
    var el = addNewElement(div, 'ul');
    closeLink = addNewElement(addNewElement(el, 'li'), 'button', strClose);
    addNewClass(closeLink, 'btn_select btn_blue_light');
  })();


  /* Build table with quesitons. */

  var makeClickHandler = (function() {
    var questionShown = false;
    var question, points, td;

    var close = function() {
      mDiv.className = '';
      questionShown = false;
      question[0].parentNode.removeChild(question[0]);
      question[1].parentNode.removeChild(question[1]);
      return false;
    };

    xLink.onclick = close;
    tieLink.onclick = function() {
      m.className += ' showAnswer';
      return false;
    };

    (function() {
      var makeTeamClickHandler = function(team) {
        return function() {
          if (team !== -1) {
            scores[team][0] += points;
            nukeChildren(scores[team][1]);
            addText(scores[team][1], '' + scores[team][0]);
          }
          td.className = '';
          td.onclick = null;
          close();
          return false;
        };
      };

      team0Link.onclick = makeTeamClickHandler(0);
      team1Link.onclick = makeTeamClickHandler(1);
      team3Link.onclick = makeTeamClickHandler(3);
      team4Link.onclick = makeTeamClickHandler(4);
      team5Link.onclick = makeTeamClickHandler(5);
      closeLink.onclick = makeTeamClickHandler(-1);
    })();

    return function(_question, _points) {
      return function() {
        if (!questionShown) {
          question = _question;
          points = _points;
          td = this;

          question[0] = question[0].cloneNode(true);
          question[1] = question[1].cloneNode(true);
          linksList.parentNode.insertBefore(question[0], linksList);
          linksList.parentNode.insertBefore(question[1], linksList);
         
          m.className = 'show';
        }
        return false;
      };
    };
  })();

  var makeScoreHandler = function(team) {
    return function() {
      var score = window.prompt('Enter new score:', scores[team][0]);
      if (score) {
        score = parseInt(score);
        scores[team][0] = score
        nukeChildren(scores[team][1]);
        addText(scores[team][1], '' + score);
        return false;
      }
    }
  };

  (function() {
    var table, rowset, row, cell;

    table = D.createElementNS(NS, 'table');
    mDiv.parentNode.insertBefore(table, mDiv);
    rowset = addNewElement(table, 'thead');
    row = addNewElement(rowset, 'tr');
    row.className = 'title';

    cell = addNewElement(row, 'th');
    cell.setAttribute('colspan', '' + categories.length);

    var title = D.getElementsByTagNameNS(NS, 'h1')[0];
    addNewElement(cell, 'h1', title.textContent);

    row = addNewElement(rowset, 'tr');
    row.className = 'categories';

    categories.forEach(function(cat) {
      cell = addNewElement(row, 'th', cat.title);
    });

    rowset = addNewElement(table, 'tbody');

    var max = 0;
    categories.forEach(function(cat) {
      if (cat.questions.length > max) {
        max = cat.questions.length;
      }
    });

    for (var i = 1; i <= max; ++i) {
      row = addNewElement(rowset, 'tr');

      categories.forEach(function(cat) {
        cell = addNewElement(row, 'td');
        if (i <= cat.questions.length) {
          addText(cell, '' + (100));
          cell.className = 'active';
          cell.onclick = makeClickHandler(cat.questions[i - 1], 100);
        } else {
          addText(cell, '\u00A0');
        }
      });
    }

    rowset = addNewElement(table, 'td');
    row = addNewElement(table, 'td');
   
    var addScoreCell = function(team) {
      cell = addNewElement(row, 'td');

      var div = D.createElementNS(NS, 'td');
      cell.appendChild(div);
      div.appendChild(D.createTextNode(teams[team]));

      div = D.createElementNS(NS, 'tr');
      cell.appendChild(div);
      div.appendChild(D.createTextNode('0'));
      div.onclick = makeScoreHandler(team);
      return div;
    };
    scores.push([0, addScoreCell(0)]);
    if (categories.length > 5) {
      cell = D.createElementNS(NS, 'tfoot');
      cell.setAttribute('colspan', '' + categories.length -6);
      row.appendChild(cell);
     
    }
  scores.push([0, addScoreCell(1)]);
    scores.push([0, addScoreCell(2)]);
    scores.push([0, addScoreCell(3)]); 
    scores.push([0, addScoreCell(4)]);
    scores.push([0, addScoreCell(6)]);
  }());
    
});
