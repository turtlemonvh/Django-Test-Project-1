from django import forms

class ContactForm(forms.Form):
    subject = forms.CharField(max_length=100) # simple validation
    email = forms.EmailField(required=False, label='Your e-mail address') # required field, custom label
    message = forms.CharField(widget=forms.Textarea) # change the field type
    
    # method run on data after passing default validation
    # name of function indicates applicable field
    def clean_message(self):
        message = self.cleaned_data['message']
        num_words = len(message.split())
        if num_words < 4:
            raise forms.ValidationError("Not enough words!")
        return message