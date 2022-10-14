
// ф-я для вывода результата в рублях и копейках с разделителем н: 10 000,00 руб
const formatCurrency = n =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 2,
    }).format(n);


//навигация
{
    const navigationLinks = document.querySelectorAll('.navigation__link');
    const calcElems = document.querySelectorAll('.calc');

    navigationLinks.forEach((elemClick) => {
        elemClick.addEventListener('click', (e) => {
            e.preventDefault();
            navigationLinks.forEach(elem => {
                if (elemClick === elem) {
                    elem.classList.add('navigation__link_active');
                } else {
                    elem.classList.remove('navigation__link_active');
                }
            });
            calcElems.forEach((calc) => {
                if (elemClick.dataset.tax === calc.dataset.tax) {
                    calc.classList.add('calc_active');
                } else {
                    calc.classList.remove('calc_active');
                }
            });
        })
    })
}


{// AUSN
    const ausn = document.querySelector('.ausn');
    const formAusn = ausn.querySelector('.calc__form');
    const resultTaxTotal = ausn.querySelector('.result__tax_total');
    const calcLabelExpenses = ausn.querySelector('.calc__label_expenses');

    calcLabelExpenses.style.display = 'none';

    formAusn.addEventListener('input', () => {
        if (formAusn.type.value === 'income') {
            calcLabelExpenses.style.display = 'none';
            resultTaxTotal.textContent = formatCurrency(formAusn.income.value * 0.08);
            formAusn.expenses.value = '';
        }
        if (formAusn.type.value === 'expenses') {
            resultTaxTotal.textContent = formatCurrency((formAusn.income.value - formAusn.expenses.value) * 0.2);
            calcLabelExpenses.style.display = 'block';
        }
    });
}

{
    // Самозанятый/НПД
    const selfEmployment = document.querySelector('.self-employment');
    const formSelfEmployment = selfEmployment.querySelector('.calc__form');
    const resultTaxSelfEmployment = selfEmployment.querySelector('.result__tax');
    const calcCompensation = selfEmployment.querySelector('.calc__label_compensation');
    const resultBlockCompensation = selfEmployment.querySelectorAll('.result__block_compensation');

    const resultTaxCompensation = selfEmployment.querySelector('.result__tax_compensation');
    const resultTaxRestCompensation = selfEmployment.querySelector('.result__tax_rest-compensation');
    const resultTaxResult = selfEmployment.querySelector('.result__tax_result');

    // ф-я налоговый вычет
    const checkCompensation = () => {
        // если стоит галочка "Налоговый вычет", то показать label "Остаток вычета"
        const setDisplay = formSelfEmployment.addCompensation.checked ? 'block' : 'none';

        calcCompensation.style.display = setDisplay;
        resultBlockCompensation.forEach((elem) => {
            elem.style.display = setDisplay;
        })
    };

    checkCompensation();

    formSelfEmployment.addEventListener('input', () => {
        const resultIndividual = formSelfEmployment.individual.value * 0.04;
        const resultEntity = formSelfEmployment.entity.value * 0.06;

        checkCompensation();
        //вывод рез-та 
        const tax = resultIndividual + resultEntity;
        formSelfEmployment.compensation.value =
            formSelfEmployment.compensation.value > 10000
                ? 10000
                : formSelfEmployment.compensation.value;
        const benefit = formSelfEmployment.compensation.value;

        const resBenefit = formSelfEmployment.individual.value * 0.01 +
            formSelfEmployment.entity.value * 0.02;

        const finalBenefit = benefit - resBenefit > 0 ? benefit - resBenefit : 0;

        const finalTax = tax - (benefit - finalBenefit);

        resultTaxSelfEmployment.textContent = formatCurrency(tax);

        // вывод рез-та с налоговым вычетом
        resultTaxCompensation.textContent = formatCurrency(benefit - finalBenefit);
        resultTaxRestCompensation.textContent = formatCurrency(finalBenefit);
        resultTaxResult.textContent = formatCurrency(finalTax);
    });
}

{
    // ОСН/ОСНО 

    const osno = document.querySelector('.osno');
    const formOsno = osno.querySelector('.calc__form');
    const resultBlockDeduction = osno.querySelectorAll('.result__block_deduction');
    const resultBlockProfit = osno.querySelector('.result__block_profit');

    const resultTaxOsnoNds = osno.querySelector('.result__tax_osno-nds');
    const resultTaxOsnoProperty = osno.querySelector('.result__tax_osno-property');
    const resultTaxOsnoExpense = osno.querySelector('.result__tax_osno-expense');
    const resultTaxOsnoIncome = osno.querySelector('.result__tax_osno-income');
    const resultTaxOsnoProfit = osno.querySelector('.result__tax_osno-profit');

    //ф-я для переключения форм с ИП на ООО
    const checkFormBusiness = () => {
        if (formOsno.formBusiness.value === 'ip') {
            resultBlockProfit.style.display = 'none';
            resultBlockDeduction.forEach(block => {
                block.style.display = 'block';
            })
        }

        if (formOsno.formBusiness.value === 'ooo') {
            resultBlockDeduction.forEach(block => {
                block.style.display = 'none';
            })
            resultBlockProfit.style.display = 'block';
        }
    }

    formOsno.addEventListener('input', (e) => {
        e.preventDefault();
        checkFormBusiness();

        const income = formOsno.osnoIncome.value;
        const expenses = formOsno.osnoExpenses.value;
        const property = formOsno.osnoProperty.value;

        const nds = income * 0.2;
        const taxProperty = property * 0.02;
        const profit = income - expenses;
        const ndfExpensesTotal = profit * 0.13;
        const ndfIncomeTotal = (income - nds) * 0.13;
        const taxProfit = profit * 0.2;

        resultTaxOsnoNds.textContent = nds;
        resultTaxOsnoProperty.textContent = taxProperty;
        resultTaxOsnoExpense.textContent = ndfExpensesTotal;
        resultTaxOsnoIncome.textContent = ndfIncomeTotal;
        resultTaxOsnoProfit.textContent = taxProfit;
    })
}

{
    // УСН
    const LIMIT = 300000;
    const usn = document.querySelector('.usn');
    const formUsn = usn.querySelector('.calc__form');

    const calcLabelExpenses = usn.querySelector('.calc__label_expenses');
    const calcLabelProperty = usn.querySelector('.calc__label_property');
    const resultBlockProperty = usn.querySelector('.result__block_property');

    const resultTaxTotal = usn.querySelector('.result__tax_total');
    const resultTaxProperty = usn.querySelector('.result__tax_property');

    /* //вариант с switch/case
    const checkShopProperty = (typeTax) => {
        switch (typeTax) {
            case 'income': {
                calcLabelExpenses.style.display = 'none';
                calcLabelProperty.style.display = 'none';
                resultBlockProperty.style.display = 'none';
                formUsn.expenses.value = '';
                formUsn.property.value = '';
                break;
            };
            case 'ip-expenses': {
                calcLabelExpenses.style.display = '';
                calcLabelProperty.style.display = 'none';
                resultBlockProperty.style.display = 'none';
                formUsn.property.value = '';
                break;
            };
            case 'ooo-expenses': {
                calcLabelExpenses.style.display = '';
                calcLabelProperty.style.display = '';
                resultBlockProperty.style.display = '';
            };
        }
    }
    checkShopProperty(formUsn.typeTax.value); */

    // вариант с объектом 
    const typeTax = {
        'income': () => {
            calcLabelExpenses.style.display = 'none';
            calcLabelProperty.style.display = 'none';
            resultBlockProperty.style.display = 'none';
            formUsn.expenses.value = '';
            formUsn.property.value = '';
        },
        'ip-expenses': () => {
            calcLabelExpenses.style.display = '';
            calcLabelProperty.style.display = 'none';
            resultBlockProperty.style.display = 'none';
            formUsn.property.value = '';
        },
        'ooo-expenses': () => {
            calcLabelExpenses.style.display = '';
            calcLabelProperty.style.display = '';
            resultBlockProperty.style.display = '';
        },
    }

    const percent = {
        'income': 0.06,
        'ip-expenses': 0.15,
        'ooo-expenses': 0.15,
    }


    typeTax[formUsn.typeTax.value]();

    formUsn.addEventListener('input', (e) => {
        e.preventDefault();
        typeTax[formUsn.typeTax.value]();
        //checkShopProperty(formUsn.typeTax.value);

        const income = formUsn.income.value;
        const expenses = formUsn.expenses.value;
        const сontributions = formUsn.сontributions.value;
        const property = formUsn.property.value;

        let profit = income - сontributions;

        if (formUsn.typeTax.value !== 'income') {
            profit -= expenses;
        }

        const taxBigIncome = income > LIMIT ? (profit - LIMIT) * 0.01 : 0;
        const summ = profit - (taxBigIncome < 0 ? 0 : taxBigIncome);
        const tax = summ * percent[formUsn.typeTax.value];
        const taxProperty = property * 0.02;
        
        resultTaxTotal.textContent = formatCurrency(tax);
        resultTaxProperty.textContent = formatCurrency(taxProperty);



    });
};