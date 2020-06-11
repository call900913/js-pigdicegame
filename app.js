var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // what does it need to calculate the percentage? Total income.
  // Does that need to be passed in?
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 10000) / 100;
    } else {
        this.percentage = -1;
    }
  };

  // Note this method is on the prototype.
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach((element) => {
      sum += element.value
    });
    data.totals[type] = sum;
  };

  // you can't access this data here from the outside, so you use the return object for that.
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  // return an object that will contain all of your public methods
  return {
    addItem: function(type, des, val) {
      // this is the use of declaring var up here.
      var newItem, ID;

      // create new id
      data.allItems[type].length > 0 ?
        ID = data.allItems[type][data.allItems[type].length-1].id : ID = 0;


      // create new item
      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc'){
        newItem = new Income(ID, des, val)
      }

      // push it into data structure
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map((element) => {
        return element.id
      });

      index = ids.indexOf(id);


      if (index > -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function() {
      // calculate total incomes, expenses__list
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate percentages
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 10000) / 100
      } else {
          data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach((element) => {
        element.calcPercentage(data.totals.inc);
      });
    },

    // note you probably want to use return with map.
    // you use a getter method to keep the data private.
    getPercentages: function() {
      var allPerc = data.allItems.exp.map((element) => {
        return element.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data);
    }
  };

})();



var UIController = (function() {

  // this thing doesn't get returned, so you have to create a method in the return object to access this thing here.
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  var formatNumber = function(num, type) {
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3)
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  }

  var nodeListsForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },
    // now we want to display these items to the User Interface so users can see the stuff.
    // what kind of information do you need to display these additions?
    addListItem: function(obj, type) {
      var html, newHtml;
      // create an html string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      // replace the placeholder text with the actual data we receive from the object.
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value));

      // insert the html into the dom
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml )
    },

    deleteListItem: function(selectorID) {
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((element) => {
        element.value = ""
      });
      fieldsArr[0].focus();
    },

    // this method gets called by the appController overlord method, which inputs the obj from the other method.
    displayBudget: function(obj) {
      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp'
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '----';
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      nodeListsForEach(fields, function(element, index) {
        if (percentages[index] > 0) {
          element.textContent = percentages[index] + '%';
        } else {
          element.textContent = '----';
        }
      });
    },

    displayMonth: function() {
      var now, month, year;

      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

      nodeListsForEach(fields, function(element) {
        element.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
        return DOMstrings;
    }
  };

})();


// function(budgetCtrl, UICtrl) with this, the controller now knows about the other two modules, and it can use their code.
// set up the event listener for hte input button right here because this is the central place where i want to decide where I want to control what happens on each event
// decide what happens, and then delegate teh tasks to the other controllers.

var controller = (function(budgetCtrl, UICtrl) {

  // function that gets called to setup event Listeners
  // all the event listeners are set up here.
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();
    // notice where/when the the ctrlAddItem is called: when the enter key is hit.
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  // this thing is called each time we add a new item to the UI.
  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI.
    // this method gets fed the var from the aforementioned #2.
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {

    // calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. read percentages from budget controllers
    var percentages =  budgetCtrl.getPercentages();

    // 3. update the UI with the new percentages
    UICtrl.displayPercentages(percentages);

  };

  // function that gets called to add
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. clear the fields
      UICtrl.clearFields();

      // 5. Calculate and Update budget
      updateBudget();

      // 6. calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delte item from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. updatae and show the new budget
      // update and display hte budget changes based on the data.
      updateBudget();

      // 4. calculate and update percentages
      updatePercentages();
    }
  };



  return {
    init: function() {
      console.log('app has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  }
})(budgetController, UIController);


controller.init();
