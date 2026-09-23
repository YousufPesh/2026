(() => {
  const journey = document.querySelector('[data-journey]');
  if (!journey) return;

  const stages = [...journey.querySelectorAll('[data-stage]')];

  function closeStage(stage) {
    const trigger = stage.querySelector('.stage-trigger');
    const panel = stage.querySelector('.stage-panel');
    trigger.setAttribute('aria-expanded', 'false');
    stage.classList.remove('is-open');
    panel.hidden = true;
  }

  function openStage(stage) {
    stages.forEach((item) => {
      if (item !== stage) closeStage(item);
    });

    const trigger = stage.querySelector('.stage-trigger');
    const panel = stage.querySelector('.stage-panel');
    trigger.setAttribute('aria-expanded', 'true');
    stage.classList.add('is-open');
    panel.hidden = false;

    window.setTimeout(() => {
      const top = stage.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.62) {
        stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 220);
  }

  stages.forEach((stage) => {
    const trigger = stage.querySelector('.stage-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeStage(stage);
      else openStage(stage);
    });
  });

  const agentCopy = {
    assignment: 'Help a class navigate an assignment.',
    event: 'Help visitors find what they need at an event.',
    recurring: 'Support a repeatable campus task.'
  };

  journey.querySelectorAll('[data-agent]').forEach((choice) => {
    choice.addEventListener('click', () => {
      journey.querySelectorAll('[data-agent]').forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      journey.querySelector('[data-agent-output]').textContent = agentCopy[choice.dataset.agent];
    });
  });

  journey.querySelectorAll('[data-system]').forEach((choice) => {
    choice.addEventListener('click', () => {
      journey.querySelectorAll('[data-system]').forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      journey.querySelector('[data-system-output]').textContent = `${choice.dataset.system} event`;
    });
  });

  const testCopy = {
    normal: 'Follow the request from trigger to output.',
    missing: 'Find where the workflow pauses without context.',
    access: 'Check that each role sees only what it should.'
  };

  journey.querySelectorAll('[data-test]').forEach((choice) => {
    choice.addEventListener('click', () => {
      journey.querySelectorAll('[data-test]').forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      journey.querySelector('[data-test-output]').textContent = testCopy[choice.dataset.test];
    });
  });

  const audienceRoles = {
    classroom: ['students', 'faculty'],
    group: ['faculty', 'staff'],
    campus: ['students', 'faculty', 'staff', 'admins']
  };

  journey.querySelectorAll('[data-audience]').forEach((choice) => {
    choice.addEventListener('click', () => {
      journey.querySelectorAll('[data-audience]').forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      const activeRoles = audienceRoles[choice.dataset.audience];
      journey.querySelectorAll('[data-role]').forEach((role) => {
        role.classList.toggle('is-active', activeRoles.includes(role.dataset.role));
      });
    });
  });
})();
