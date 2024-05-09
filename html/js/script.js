const s_click = new Audio('./sounds/click.mp3');
const s_hover = new Audio('./sounds/hover.wav');
const s_open = new Audio('./sounds/transition.ogg');

s_click.volume = 0.2;
s_hover.volume = 0.2;
s_open.volume = 0.1;

$(document).keydown(function (e) {
	if (e.key === 'Escape') {
		$('.bg').removeClass('open');
		$('.footer-home').css('opacity', 0);
		
		fetch('closeMenu');
		s_open.currentTime = '0';
		s_open.play();
	}
});

$.post('https://${GetParentResourceName()}/PlayerId', JSON.stringify({}), function (data) { //id del jugador
	$('#player-id').text(data);
});

function numberWithCommas(x) {
	var parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return parts.join(',');
}

$('document').ready(function () {
	$('.footer-home').css('opacity', 0);
	window.addEventListener('message', function (event) {
		switch (event.data.action) {
			case 'updatejobs':
				$('.police .d-data').text(
					event.data.police 
				);
				$('.ems .d-data').text(
					event.data.ems 
				);
			case 'OpenMenu':
				$('.bg').addClass('open');
				$('#name').text(event.data.name);
				$('#job-name').text(event.data.job);

				$('#text-cash').text(numberWithCommas(event.data.cash) + '$');
				$('#text-bank').text(numberWithCommas(event.data.bank) + '$');

				if (event.data.discord) {
					$('.discord').attr('url', event.data.discord);
				}

				if (event.data.instagram) {
					$('.instagram').attr('url', event.data.instagram);
				} else {
					$('.instagram').hide();
				}

				if (event.data.twitter) {
					$('.twitter').attr('url', event.data.twitter);
				} else {
					$('.twitter').hide();
				}

				if (event.data.youtube) {
					$('.youtube').attr('url', event.data.youtube);
				} else {
					$('.youtube').hide();
				}

				if (event.data.discord) {
					const regex = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i;
					const domain = event.data.discord.match(regex)[1];
					const formattedWebsite = domain.startsWith('www.')
						? domain.slice(4)
						: domain;
					// Use formattedWebsite as needed

					$('.web').attr('url', event.data.discord).text(formattedWebsite);
				} else {
					$('.web').hide();
				}

				$('.players .d-data').text(
					event.data.usersOnline + '/' + event.data.maxPlayers
				);
				$('.police .d-data').text(
					event.data.police 
				);
				$('.ems .d-data').text(
					event.data.ems 
				);
				s_open.currentTime = '0';
				s_open.play();
				break;
		}
	});
});

$(document).on('mouseenter', '.btn-sound', function () {
	s_hover.currentTime = '0';
	s_hover.play();
});

$(document).on('click', '.btn-sound', function () {
	s_click.currentTime = '0';
	s_click.play();
});

$(document).on('click', '.btn-menu', function () {
	const action = $(this).attr('action');
	switch (action) {
		case 'map':
			fetch('openMap');
			$('.bg').removeClass('open');
			fetch('closeMenu');

			break;

		case 'settings':
			fetch('openSettings');
			$('.bg').removeClass('open');
			fetch('closeMenu');

			break;

		case 'quit':
			OpenModal();
			break;
	}
});

$(document).on('click', '.pagar-factura', function () {
	const billid = $(this).attr('billid');
	const yo = $(this);
	const job = $(this).attr('jbo');
	const price = $(this).attr('price');
	s_click.currentTime = '0';
	s_click.play();
	$.post('https://${GetParentResourceName()}/paybill', JSON.stringify({
		id: parseInt(billid),
		job : job,
		price : parseInt(price)
	}), function(results) {
	
			if (results == true) {
				yo.parent().addClass(
					'animate__animated animate__fadeOutLeft animate__faster'
				);
				setTimeout(() => {
					yo.parent().remove();
				}, 500);
			} 
		
	});

});

$(document).on('click', '.facturas', function () {


});

function OpenModal() {
	$('body').append(`
    <div class="c-modal fadeIn">
       <div class="modal-block">
            <div class="modal-content scale-in-2" style="width: max-content">

                <div class="modal-body">
					Estas seguro de querer salirte del servidor?
                </div>
                <div class="modal-footer">
                    <button class="btn-modal btn-sound" onclick='quitGame()'>
						SI</button>
                    <button class="btn-cancel btn-sound" onclick='CloseModal()'>No</button>
                </div>
            </div>
        </div>
    </div>
    `);
}

function quitGame() {
	fetch('exitGame');
}

function CloseModal() {
	$('.c-modal .modal-block .modal-content')
		.removeClass('scale-in-2')	
		.addClass('scale-out-2');
	$('.c-modal')
		.removeClass('fadeIn')
		.fadeOut(500, function () {
			$(this).remove();
		});
}

$(document).on('click', '.link', function () {
	const url = $(this).attr('url');
	if (url) {
		window.invokeNative('openUrl', url);
	}
});


$(document).on('click', '.discord', function () {
    var $footerHome = $('.footer-home');
    var currentOpacity = $footerHome.css('opacity');

    // Check if the current opacity is 1
    if (currentOpacity == 1) {
        // If yes, animate the opacity to 0
        $footerHome.animate({ opacity: 0 }, 300); // 1000 is the duration in milliseconds
    } else {
        // If not, animate the opacity to 1
		$.post('https://${GetParentResourceName()}/facturas', JSON.stringify({
		}), function(results) {

			if (results && results.length > 0) {
				$('.footer-home .lista-facturas').html('');
				results.map((bill) => {
		
					$('.footer-home .lista-facturas').append(`
					<div class="factura">
					<img src="https://cdn.discordapp.com/attachments/1172320936486248459/1196954004270354573/bill.png" class="img-fluid">
					 <div class="info-factura">
							<h4>${bill.title}</h4>
						</div>
						<div class="precio-factura text-center">
							<h4 class="text-success">${bill.price}$</h4>
						</div>
						<button class="btn btn-action p-1 pagar-factura" price="${bill.price}" job="${bill.job}" billid="${bill.billId}">PAGAR</button>
					</div>
					`);
				});
			} else {
				$('.footer-home .lista-facturas').html(
					`<div class="w-100 p-1 text-muted text-center">NO HAY FACTURAS PENDIENTES</div>`
				);
			}
		
		
			});
			$.post('https://${GetParentResourceName()}/negocios', JSON.stringify({
			}), function(results) {
		
				if (results && results.length > 0) {
					$('.footer-home .lista-comercios').html('');
					results.map((negocio) => {
		if(negocio.open){
						$('.footer-home .lista-comercios').append(`
						<div class="factura animate__animated animate__fadeInUp anim_titulo animate__faster" x="${negocio.coords.x}" y="${negocio.coords.y}"  style="animation-delay:0.2s">
						<img src="https://i.imgur.com/gLJFRFX.png" class="img-fluid">
							<div class="info-factura">
								<h3 class="bankgothic">${negocio.label}</h3>
							</div>
							<button class="btn btn-action set-waypoint p-1"><i class="lni lni-map-marker"></i></button>
						</div>
						`);
					}
					});
				} else {
					$('.footer-home .lista-comercios').html(
						`<div class="w-100 p-1 text-muted text-center">NO HAY NEGOCIOS DISPONIBLES</div>`
					);
				}
			
			
				});
        $footerHome.animate({ opacity: 1 }, 300); // 1000 is the duration in milliseconds
    }
});
$(document).on('click', '.set-waypoint', function () {
	const e = $(this).parent();
	const x = parseFloat(e.attr('x'));
	const y = parseFloat(e.attr('y'));
	fetch('SetWaypointinCoords', { x, y });
});


function fetch(event, data) {
	return $.post(
		'https://${GetParentResourceName()}/' + event || {},
		JSON.stringify(data)
	).promise();
}
