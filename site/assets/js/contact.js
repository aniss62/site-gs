/* ============================================================
   contact.js — Form validation and AJAX submission
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const alertSuccess = document.getElementById('form-alert-success');
  const alertError = document.getElementById('form-alert-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    hideAlerts();

    const data = Object.fromEntries(new FormData(form).entries());

    // Champ piège anti-spam : un robot le remplit, on ne fait rien
    if (data.website) {
      setLoading(false);
      return;
    }

    // Aucun serveur ni service tiers : on prépare l'e-mail dans la messagerie du visiteur.
    // Nom lisible du produit choisi (et non son identifiant technique)
    const productSelect = form.querySelector('#product');
    const productLabel = productSelect && productSelect.selectedIndex > 0
      ? productSelect.options[productSelect.selectedIndex].text.trim()
      : data.product;

    const lines = [
      `Nom : ${data.name}`,
      data.company ? `Société : ${data.company}` : null,
      data.country ? `Pays : ${data.country}` : null,
      `E-mail : ${data.email}`,
      data.phone ? `Téléphone : ${data.phone}` : null,
      data.product ? `Produit : ${productLabel}` : null,
      '',
      'Message :',
      data.message
    ].filter(l => l !== null);

    const subject = `Demande de contact : ${data.name}${data.company ? ` (${data.company})` : ''}`;
    const href = 'mailto:Office@lesgreniersdusaiss.ma'
      + `?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(lines.join('\n'))}`;

    window.location.href = href;
    alertSuccess.classList.add('show');
    alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setLoading(false);
  });

  function validateForm() {
    let valid = true;

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    clearError('name-error', name);
    clearError('email-error', email);
    clearError('message-error', message);

    if (!name.value.trim()) {
      showError('name-error', name, I18N?.get('contact.form_name') || 'Nom requis');
      valid = false;
    }

    const emailVal = email.value.trim();
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      showError('email-error', email, 'Email invalide');
      valid = false;
    }

    if (!message.value.trim()) {
      showError('message-error', message, 'Message requis');
      valid = false;
    }

    return valid;
  }

  function showError(id, field, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
    if (field) field.classList.add('error');
  }

  function clearError(id, field) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
    if (field) field.classList.remove('error');
  }

  function hideAlerts() {
    alertSuccess?.classList.remove('show');
    alertError?.classList.remove('show');
  }

  function setLoading(loading) {
    submitBtn.classList.toggle('loading', loading);
    submitBtn.disabled = loading;
  }

  // Clear errors on input
  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const errorId = field.id + '-error';
      const errorEl = document.getElementById(errorId);
      if (errorEl) errorEl.textContent = '';
    });
  });
});
