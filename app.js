
//Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else { this.percentage = -1; }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };


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


    return {
        addItem: function (type, des, val) {

            var newItem, ID;

            // [1,2,3,4,5]  next Id = 5
            //  [1,2,4,6,8] next Id = 9
            // ID = last ID + 1    // //Last Id = arraylength - 1

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //Create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {

            var ids, index;

            //id =3
            // [1,2,4,6,8] //6 will be deleted by data.allItems[type][id]; so we cant use this
            //ids =  [1,2,4,6,8]

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {

            //1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2. Calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {
            /*
            a =10
            b=20
            c=40
            income =100
            a=10/100 =10%
            b=20/100 =20%
            c=40/100 =40%
             */
            data.allItems.exp.forEach(function (current) {

                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        testing: function () {
            console.log(data);
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage

            };
        },

    }

})();

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//UI COntroller

var UiController = (function () {
    var domStrings = {

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
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, integer, decimal, type;
        /* + or - before numbers
        exactly 2 decimal points
        comma separating thousands
        2310.4567 = 2,310.46
        2000 = 2,000.00       
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.')

        integer = numSplit[0];
        if (integer.length > 3) {
            integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
            // input(23510) output(23,510)
        }

        decimal = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';
        return (type === 'exp' ? '-' : '+') + ' ' + integer + '.' + decimal;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {

            return {
                type: document.querySelector(domStrings.inputType).value,      //will be either inc or exp as per html code
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };

        },

        addListItem: function (obj, type) {
            //1. Create html string with placeholder text
            var html, newHtml, element;

            if (type === 'inc') {
                element = domStrings.incomeContainer;

                html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>  </div>     </div>   </div >';
            }

            else if (type === 'exp') {
                element = domStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">   <div class="item__value">%value%</div>  <div class="item__percentage">21%</div> <div class="item__delete">     <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div>  </div>   </div >';
            }

            //2. Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));



            //3. Insert HTML into the Dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArray;

            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {

                current.value = "";

            });

            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(domStrings.expPercentageLabel);

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayMonth: function () {
            var now, year, month, months;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {

            var fields = document.querySelectorAll(

                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue);

            nodeListForEach(fields, function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(domStrings.inputBtn).classList.toggle('red');

        },

        getDomStrings: function () {
            return domStrings;
        }
    };


})();

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Global App Controller

var controller = (function (budgetCtrl, UiCtrl) {

    var setupEventListners = function () {

        var dom = UiCtrl.getDomStrings();

        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(dom.inputType).addEventListener('change', UiCtrl.changedType);

    };

    var updateBudget = function () {
        //1.Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UiCtrl.displayBudget(budget);
    };


    var ctrlAddItem = function () {

        var input, newItem;

        //1. Get the filled input data
        input = UiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UiCtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UiCtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            //inc-1
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delete item fro UI
            UiCtrl.deleteListItem(itemId);

            //3. Update and show new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();

        }

    };

    var updatePercentages = function () {
        //1. calculate percentages
        budgetCtrl.calculatePercentages();

        //2.Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentage
        UiCtrl.displayPercentages(percentages);

    };


    return {
        init: function () {

            console.log('Application has started.');
            UiCtrl.displayMonth();

            UiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListners();

        }
    }



})(budgetController, UiController);

//Initialization function-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

controller.init();