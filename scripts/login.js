//this file just animanted the text on the log in and sign up pages , but it will also be used for the add and edit diry entries

const inputs = document.querySelectorAll('.input');

function focusFunc(){
	let parent = this.parentNode.parentNode;
	parent.classList.add('focus');
}

function blurFunc(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove('focus');
	}
	
}

inputs.forEach(input => {
	input.addEventListener('focus', focusFunc);
	input.addEventListener('blur', blurFunc);
});

