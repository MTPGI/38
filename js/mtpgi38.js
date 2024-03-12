"use strict";

// HELPER FUNCTIONS

const 
	$id = id => {
		return document.getElementById(id)
	},
	$q = Element.prototype.$q = function(q) {
		let r = (this instanceof Element ? this : document).querySelectorAll(q);
		return /*r.length === 1 ? r[0] :*/ r.length ? Array.from(r) : null;
	},
	show = (el) => el.classList.remove('hide'),
	hide = (el) => el.classList.add('hide'),
	/*show = el => el.classList.remove('hide'),
    hide = el => el.classList.add('hide'),*/
	debounce = (fn, time) => {
		time = time || 100;
		let timer;
		return function(event) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(fn, time, event);
		}
	},
	encodeLinks = () => {
		function encodeAllCharacters(str) {
			return Array.from(str).map(char => "%" + char.charCodeAt(0).toString(16).toUpperCase()).join("");
		}
		const emailLinks = document.querySelectorAll("a.email");
		const telLinks = document.querySelectorAll("a.tel");
		emailLinks.forEach(link => {
			const href = link.getAttribute("href");
			if (href.startsWith("mailto:")) {
				const encodedHref = "mailto:" + encodeAllCharacters(href.substring(7));
				link.setAttribute("href", encodedHref);
			}
		});
		telLinks.forEach(link => {
			const href = link.getAttribute("href");
			if (href.startsWith("tel:")) {
				const encodedHref = "tel:" + encodeAllCharacters(href.substring(4));
				link.setAttribute("href", encodedHref);
			}
		});
		return document.documentElement.innerHTML;
	};

// GLOBAL VARIABLES

var	masonry;
const villes = {
	"AMPUIS":"007",
    "BARRAUX":"027",
    "BEAUREPAIRE":"034",
    "LE BOURG-D’OISANS":"052",
    "BOURGOIN-JALLIEU":"053",
    "CHASSE-SUR-RHÔNE":"087",
	"CHAVANOZ":"097",
    "LA CÔTE-SAINT-ANDRÉ":"130",
    "CRÉMIEU":"138",
    "CROLLES":"140",
    "ÉCHIROLLES":"151",
    "EYBENS":"158",
    "FONTAINE":"169",
    "FONTANIL-CORNILLON":"170",
    "GIÈRES":"179",
    "GRENOBLE":"185",
    "L’ISLE-D’ABEAU":"193",
    "MENS":"226",
    "MEYLAN":"229",
    "MONESTIER DE CLERMONT":"242",
    "LA MURE":"269",
    "PONTCHARRA":"314",
    "LE PONT DE BEAUVOISIN":"315",
    "PONT-DE-CHÉRUY":"316",
    "LE PONT-DE-CLAIX":"317",
    "PONT-EN-ROYANS":"319",
    "ROUSSILLON":"344",
    "SAINT-ÉGRÈVE":"382",
    "SAINT-ISMIER":"397",
    "SAINT-LAURENT-DU-PONT":"412",
    "SAINT-MARCELLIN":"416",
    "SAINT-MARTIN-D’HÈRES":"421",
    "SEYSSINS":"486",
    "LA TOUR-DU-PIN":"509",
    "LA TRONCHE":"516",
    "TULLINS":"517",
    "VIENNE":"544",
    "VIF":"545",
    "VILLARD-BONNOT":"547",
    "VILLARD-DE-LANS":"548",
    "VILLEFONTAINE":"553",
    "VIZILLE":"562",
    "VOIRON":"563"
},
classNames = {
	email:'E-mail',
	tel:'Téléphone',
	url:'Site internet',
	adr:'Adresse',
	bus:'Transports en commun',
	info:'Informations',
	hours:'Horaires',
	acc: 'Accessibilité',
	facebook:'Compte Facebook',
	twitter:' Compte Twitter',
	instagram: 'Compte Instagram',
	youtube: 'Chaîne Youtube'
};

function filtrerArticles() {
	const cityVal = $id("select--ville").value;
	const keywVal = $id("select--categories").value;
	const cityStr = cityVal ? `[data-city*="${cityVal}"]` : "";
	const keywStr = keywVal ? `[data-keyword*="${keywVal}"]` : "";
	const articlesHide = (cityStr || keywStr) ? $q(`article:not(${cityStr}${keywStr})`) : $q(`article`) ;
	const articlesShow = (cityStr || keywStr) ? $q(`article${cityStr}${keywStr}`) : $q(`article`);
	$q(".card").forEach(show);
	articlesHide.forEach(hide);
	articlesShow.forEach(show);
	if (cityVal) $q(`.card:not([data-city*="${cityVal}"])`).forEach(hide);
	setSelectableLetters();
	$id("text--resultats").innerHTML = (0 == articlesShow.length ? "aucun" : articlesShow.length) + "&nbsp;r&eacute;sultat" + (1 < articlesShow.length ? "s" : "");
	masonry && masonry.recalculate(!0, !0);
}
function goSearch() {
	const input = $id('input--search');
	const selectedOption = $q(`#searchlist option[value="${input.value}"]`);
	if (selectedOption) {
	  const dataType = selectedOption.dataset.type;
	  const value = selectedOption.value;
	  switch(dataType) {
		  case "category": {
			  $q(`article:not([data-keyword*="${value}"])`).forEach(hide);
			  $q(`article[data-keyword*="${value}"]`).forEach(show);
			  masonry && masonry.recalculate(!0, !0);
		  };break;
		  case "city": {
			$q(`article:not([data-city*="${value}"]),.card:not([data-city*="${value}"])`).forEach(hide);
			$q(`article[data-city*="${value}"],.card[data-city*="${value}"]`).forEach(show);
			masonry && masonry.recalculate(!0, !0);
		  };break;
		  case "title": {
			scrollTo($q(`article[data-vcard="${value}"]`))
		  };break;
	  }
	} else {
	  console.log("No option selected");
	}
	input.value= '';
	input.blur();
}

function selectAllText(artOrCard) {
	if (window.getSelection) {
		const selection = document.getSelection();
		selection.removeAllRanges();
		const range = document.createRange();
		range.setStart(artOrCard.querySelector("header, h3"), 0);
		range.setEndBefore($id("modale"));
		window.getSelection().addRange(range);
	}
}

function scrollTo(elem) {
	show(elem);
	elem.classList.add("highlight");
	elem.scrollIntoView({behavior: "smooth"});
}

function toMap(event, addressLink) {
	const isDesktop = (!/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)));
	if (isDesktop && addressLink.href) {
		event.preventDefault();
		const geoURI = addressLink.href.split(/[:,]/),
		      lat = geoURI[1], 
			  lng = geoURI[2];
		window.open(`https://www.openstreetmap.org/directions?to=${lat},${lng}#map=18/${lat}/${lng}`, "_blank");
	}
}

function toClipboard(text) {
	const copylistener = (e) => {
		e.preventDefault();
		if (e.clipboardData) {
			e.clipboardData.setData("text/plain", text.innerText);
			e.clipboardData.setData("text/html", text.innerHTML);
			document.documentElement.style.setProperty("--copy-opacity", "1");
			setTimeout(() => {
				document.documentElement.style.setProperty("--copy-opacity", "0");
			}, 3000);
		}
		document.removeEventListener("copy", copylistener);
	};
	document.addEventListener("copy", copylistener);
	document.execCommand("copy");
}

function printArticle(article) {
	const response = confirm("Par souci d'économie, le document a été passé en niveau de gris.\n\nÉconomisez du papier et privilégiez la copie numérique\nou activez le recto/verso !\n\nJe souhaite imprimer ?");
	if (!response) return false;
	const fr = document.createElement("iframe");
	fr.name = "fr";
	document.body.appendChild(fr);
	const 
		frameDoc = fr.contentWindow ? fr.contentWindow : fr.contentDocument.document ? fr.contentDocument.document : fr.contentDocument,
		title = article.$q("h2").innerText,
		content = article.outerHTML;
	frameDoc.document.open();
	frameDoc.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="style.css" type="text/css"></head><body>${content}</body></html>`);
	frameDoc.document.close();
	setTimeout(function() {
		window.frames["fr"].focus();
		window.frames["fr"].print();
		document.body.removeChild(fr);
	}, 500);
}

// VCARD RELATED FUNCTIONS

function showQRCode(artOrCard, isCard) {
	if (!$id("qr-code").classList.contains("hide")) {
		hideQRCode();
		return
	}
	const img = $q("#qr-code img");
	img && img.remove();
	const data = generateVCARDtext(artOrCard, isCard);
	const qr = qrcode(0, "L");
	qr.addData(data, "Byte");
	qr.make();
	const imgTag = qr.createImgTag(5, 0);
	$id("qr-code").appendChild(imgTag);
	show($id("qr-code"));
}

function hideQRCode() {
	let img = $q("#qr-code img");
	img && img[0].remove();
	hide($id("qr-code"));
}

function getVCARDUrlParamAndDownload() {
	const params = new URLSearchParams(window.location.search),
		  vcarddata = params.get("vcard"),
		  index = params.get("i");
	if (vcarddata) {
		if (index) {
			generateAndDownloadVCFfile($q(`[data-vcard=${vcarddata}]`).$q(".card")[+index], true)
		} else {
			generateAndDownloadVCFfile($q(`[data-vcard=${vcarddata}]`), false)
		}
	}
}

function generateAndDownloadVCFfile(artOrCard, isCard) {
	function convertName(str){
		return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9\s-_]/gi, "").replace(/[\s_-]+/g, "_");
	}
	const
		parentArticle = isCard ? artOrCard.parentElement : artOrCard,
		vcard_name = isCard ? convertName(artOrCard.querySelector("h3").textContent) : parentArticle.getAttribute("data-vcard"),
		text = generateVCARDtext(artOrCard, isCard),
		textToBLOB = new Blob([text], { type: "text/vcard" }),
		newLink = document.createElement("a");
	newLink.download = vcard_name + ".vcf";
	if (window.webkitURL != null) {
		newLink.href = window.webkitURL.createObjectURL(textToBLOB);
	} else {
		newLink.href = window.URL.createObjectURL(textToBLOB);
		newLink.style.display = "none";
		document.body.appendChild(newLink);
	}
	newLink.click();
	newLink.remove();
}

function generateVCARDtext (artOrCard, isCard) {
	const
		parentArticle = isCard ? artOrCard.parentElement : artOrCard,
		vcard_name = parentArticle.getAttribute("data-vcard"),
		firstCard = parentArticle.querySelector(".card");
	var feed;

	function generateCard(content) {
		let vcard_text = "BEGIN:VCARD\nVERSION:3.0\nPRODID:-//MTPGI38//NONSGML v1.0//FR\nTZ:+01:00\n";
		const index = isCard ? "&i=" + Array.from(parentArticle.querySelectorAll(".card")).indexOf(artOrCard) : "";
		const escapeChar = txt => txt.replace(/[\n\r\t]+/g, " ").replace(/\(.+?\)/, "").replace(/([\\,;:])/g, "\\$1");
		vcard_text += "SOURCE:http://mtpgi.github.io/38?vcard=" + vcard_name + index + "\n";
		vcard_text += "REV:" + $id("revision").innerText.split("/").reverse().join("-") + "T00:00:00Z\n";
		const name = content.find(el => el.nodeName === "H2") || content.find(el => el.nodeName === "H3");
		vcard_text += "FN:" + escapeChar(name.innerText) + "\n";
		const note = name.querySelector("p");
		note && (vcard_text += "NOTE:" + escapeChar(note.innerText) + "\n")
		content.filter(el => el.classList.contains("tel")).forEach(function(n) {
			//const telTypes = ["HOME", "WORK", "PREF", "VOICE", "FAX", "MSG", "CELL", "VIDEO", "TEXTPHONE", "TEXT"];
			const telType = (n.href.startsWith("tel:+336") || n.href.startsWith("tel:06")) ? "CELL" : "VOICE";
			const pref = n.classList.contains("pref") ? ";PREF=1" : "";
			vcard_text += "TEL;TYPE=" + telType + pref + ":" + n.href.split(":")[1] + "\n";
		});
		content.filter(el => el.classList.contains("email")).forEach(function(n) {
			vcard_text += "EMAIL:" + n.href.split(":")[1] + "\n"
		});
		content.filter(el => el.classList.contains("url")).forEach(function(n) {
			vcard_text += "URL:" + n.href + "\n"
		});
		content.filter(el => el.className.match(/^facebook|instagram|twitter$/)).forEach(function(n) {
			const rs = n.classList.value;
			vcard_text += `X-SOCIALPROFILE;type=${rs};x-user=${rs}user:${n.href}\n`
		});

		content.filter(el => el.classList.contains("adr")).forEach(function(n) {
		  const postOfficeBox = n.querySelector(".post-office-box"),
				extendedAddress = n.querySelector(".extended-address"),
				streetAddress = n.querySelector(".street-address"),
				locality = n.querySelector(".locality"),
				postalCode = n.querySelector(".postal-code"),
				getContent = c => c ? c.innerText.replace(/([\\,;:])/g, "\\$1").replace(/[\n\r]+/, "\\n") :	"",
				adr = "ADR:" 
					  + getContent(postOfficeBox) + ";"
					  + getContent(extendedAddress) + ";"
					  + getContent(streetAddress) + ";"
					  + getContent(locality) + ";;"
					  + getContent(postalCode) 
					  + ";FRANCE\n",
				geoURI = n.href;
			if (postOfficeBox || extendedAddress || streetAddress || locality || postalCode) {
				vcard_text += adr
			}
			if (geoURI) {
				const spl = geoURI.split(/[:,]/);
				vcard_text += "GEO:" + spl[1] + ";" + spl[2] + "\n";
			}
		});
		vcard_text += "END:VCARD";
		return vcard_text;
	}

	function extractBeforeFirstCard() {
		const elementsBeforeFirstCard = [],
			  childNodes = firstCard.parentNode.$q("*");
		for (let node of childNodes) {
			if (node === firstCard)  break;
			elementsBeforeFirstCard.push(node);
		}
		return elementsBeforeFirstCard
	}
	if (isCard) {
		const cardContent = artOrCard.$q("h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram");
		feed = [...extractBeforeFirstCard(), ...cardContent];
		return generateCard(feed, isCard);
	} else {
		if (firstCard) {
			feed = [];
			parentArticle.querySelectorAll(".card").forEach(card => {
				const cardContent = card.$q("h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram");
				feed.push([...extractBeforeFirstCard(), ...cardContent]);
			});
			let fusionnedVcard = "";
			for (let i = 0; i < feed.length; i++) {
				fusionnedVcard += generateCard(feed[i]) + "\n";
			}
			return fusionnedVcard
		} else {
			feed = parentArticle.$q("h2, h2 p, h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram");
			return generateCard(feed);
		}
	}
}

// INIT FUNCTIONS, REUSED LATER

function correctHeight() {
	const ch = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${ch}px`);
}
	
function setSelectableLetters() {
	const arrayOfLetters = [];
	document.querySelectorAll("article:not(.hide)").forEach(article => {
	  const firstLetter = article.dataset.vcard.charAt(0);
	  if (!arrayOfLetters.includes(firstLetter)) arrayOfLetters.push(firstLetter);
	});
	$id("select--AZ").innerHTML = $id("select--AZ").children[0].outerHTML;
	arrayOfLetters.forEach(letter => {
	  const option = document.createElement("option");
	  option.value = letter;
	  option.textContent = letter.toUpperCase();
	  $id("select--AZ").appendChild(option);
	});
}

function populateDatalist() {
	function createItem(text,val,type) {
		let item = document.createElement("option");
		item.value = val;
		item.textContent = text;
		item.setAttribute("data-type",type)
		$id("searchlist").appendChild(item);
	}
	$id("select--categories").$q("option").forEach((opt, i) => {
		if (i === 0) return
		createItem(opt.innerText,opt.value,"category")
	});
	$id("select--ville").$q("option").forEach((opt, i) => {
		if (i === 0) return
		createItem(opt.innerText,opt.value,"city")
	});
	$q("article").forEach(article => createItem(article.querySelector("h2").innerText,article.dataset.vcard,"title"));
}

function setLocalities() {
	const citiesArray = []; 
	document.querySelectorAll(".locality").forEach(city => {
		const 
			article = city.closest("article"),
			card = city.closest(".card"),
			cityText = city.innerText.trim().toUpperCase().split(" CEDEX")[0],
			cityNb = villes[cityText];
		if (cityNb) {
			if (!citiesArray.some(c => c.nb === cityNb)) citiesArray.push({ text: cityText, nb: cityNb });
			if (article.dataset.city) {
				article.dataset.city += `,${cityNb}`;
			} else {
				article.dataset.city = cityNb;
			}
			if (card) card.dataset.city = cityNb;
		} else {
		  console.error(cityText+ " has no match in the array")
		}
	});
	citiesArray.sort((a, b) => {
		const removePronoun = (text) => text.replace(/^L([AE] |')/, '');
		const normalizedA = removePronoun(a.text);
		const normalizedB = removePronoun(b.text);
		return normalizedA.localeCompare(normalizedB);
	});
	citiesArray.forEach(city => {
		const option = document.createElement("option");
		option.value = city.nb;
		option.textContent = city.text;
		$id("select--ville").appendChild(option);
	});
}

// THEME FUNCTIONS

function setTheme(theme) {
	if (theme === "dark") {
		document.documentElement.classList.add("theme-dark");
		$id('chk--theme-switch').setAttribute("checked","true");
		$id('chk--theme-switch').setAttribute("aria-label","Passer au thème clair");
	} else {
		document.documentElement.classList.remove("theme-dark");
		$id('chk--theme-switch').removeAttribute("checked","true");
		$id('chk--theme-switch').setAttribute("aria-label","Passer au thème sombre");
	}
	if (isLocalStorageAvailable) localStorage.setItem("theme", theme);
}

function themeChecking() {
	if (window.matchMedia) {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			const pref = event.matches ? "dark" : "light";
			setTheme(pref);
		});
	}
	if (document.documentElement.classList.contains("theme-dark")) {
		setTheme("dark")
	}
}

// HANDLE EVENTS FUNCTIONS

var hoveredCardOrArticle;
function handleTouchOrHover(event) {
	const  article = event.target.closest("article"),
		   card = event.target.closest(".card");
	if (event.type == "mouseover" && !$id("qr-code").classList.contains("hide")) {
		return
	}
	if (!article) {
		hoveredCardOrArticle = false;
		hide($id("modale"));
		hideQRCode();
		return
	}
	if (card) {
		show($id("btn-qrcode"));
		if (card !== hoveredCardOrArticle) {
			hideQRCode();
			hoveredCardOrArticle = card;
			card.appendChild($id("modale"));
			show($id("modale"));
		}
	} else {
		let hasCard = article.querySelector(".card");
		if (hasCard) {
			hide($id("btn-qrcode"));
		} else {
			show($id("btn-qrcode"));
		}
		if (article !== hoveredCardOrArticle) {
			hideQRCode();
			hoveredCardOrArticle = article;
			article.appendChild($id("modale"));
			show($id("modale"));
		}
	}
}

function handleClick(event) {
	const t = event.target,
		  a = t.closest("article"),
		  c = t.closest(".card");
	"chk--theme-switch" == t.id			&& setTheme($id('chk--theme-switch').checked ? "dark" : "light");
	"btn--to-top" == t.id	 			&& (event.preventDefault(), $id("nav-bar").scrollIntoView({behavior: "smooth"}));
	t.closest(".adr") 					&& (toMap(event, t.closest(".adr")));
	t.closest("#btn-selectall")			&& selectAllText(c || a);
	t.closest("#btn-copy") 				&& toClipboard(c || a);
	t.closest("#btn-savecontact") 		&& generateAndDownloadVCFfile(c || a, c ? true : false);
	t.closest("#btn-print") 			&& printArticle(a);
	t.closest("#btn-qrcode") 			&& showQRCode(c || a, c ? true : false);
	!t.closest("#apropos") 				&& $id("apropos").removeAttribute("open");
	!t.closest("#qr-code, #btn-qrcode") && hideQRCode();
}
function handleScroll(event) {
	if ($id("container").scrollTop > window.innerHeight) {
		show($id("btn--to-top"));
	} else {
		hide($id("btn--to-top"));
	}
}
function handleChange(event) {
	const t = event.target;
	if (t.id == "select--categories" || t.id == "select--ville") {
		filtrerArticles();
		$id("container").scrollTop = 0;
	}
	if (t.id == "select--AZ") {
		const targetArticle = document.querySelector(`article[data-vcard^="${t.value}"]:not(.hide)`);
		targetArticle && targetArticle.scrollIntoView({behavior: "smooth"});
		$id("select--AZ").selectedIndex = 0;
	}
}

function handleBeforePrint(event) {
	/*event.preventDefault();
	const response = confirm("Par souci d"économie, le document a été passé en niveau de gris.\n\nÉconomisez du papier et privilégiez la copie numérique\nou activez le recto/verso !\n\nJe souhaite imprimer ?");
	if (response) {
	  window.removeEventListener("beforeprint", handleBeforePrint);
	  window.print();
	}*/
}

function handleAfterPrint() {
	window.addEventListener("beforeprint", handleBeforePrint);
}

window.addEventListener("DOMContentLoaded", () => {
	//$id("select--categories").selectedIndex = $id("select--ville").selectedIndex = $id("select--AZ").selectedIndex = 0;
	$id("text--resultats").innerHTML = $q("article").length + "&nbsp;r&eacute;sultats";
	//$id("input--search").value = "";
	setLocalities();
	//populateDatalist();
	setSelectableLetters();
	getVCARDUrlParamAndDownload();
	themeChecking();
});

window.addEventListener("load", () => {
	if (window.innerWidth > 900) {
		$id("main").classList.remove("flex");
		masonry = new Macy({
			container: "main",
			mobileFirst: true,
			columns: 3,
			margin: {y: 50,x: 30},
			breakAt: {1500: 4, 940: 2, 630: 1 }
		});
	}
	correctHeight();
});

window.addEventListener("resize", debounce(correctHeight, 500));
window.addEventListener("beforeprint", handleBeforePrint);
window.addEventListener("afterprint", handleAfterPrint);
document.addEventListener("touchstart", handleTouchOrHover);
document.addEventListener("mouseover", handleTouchOrHover);
document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
$id("container").addEventListener("scroll", handleScroll);
//$id("input--search").addEventListener("focus", function() {this.select()});

function getAway() {
	function removeCookies(){
		var nowDate = new Date();
		nowDate.setDate(nowDate.getDate() - 7)
		var res = document.cookie;
		var multiple = res.split(";");
		for (var i = 0; i < multiple.length; i++) {
			var key = multiple[i].split("=");
			document.cookie = key[0] + " =; expires =" + nowDate;
		}
	}
	removeCookies();
  document.body.innerHTML = "Cette page est inaccessible."
  document.title="Erreur : Page inaccessible"
  window.open("https://meteofrance.com/", "_newtab");
  //sessionStorage.setItem("quick-exit-fired", 1);
  window.localStorage.removeItem("theme"); 
  //window.clipboardData.setData("text", '')
  navigator.clipboard.writeText(" ");
  setTimeout(function () {
	 window.location.replace('https://www.google.com/search?q=météo'); 
  }, 100);
  
  //history.replaceState({}, '', 'https://www.google.com/search?q=météo');
  
}

/*document.addEventListener('keydown', (e) => {
	if (e.keyCode === 27 || e.key === "Escape") getAway();
	if ((e.keyCode === 13 || e.key === "Enter") && e.target.id == "input--search") {
		goSearch();
	}
});*/