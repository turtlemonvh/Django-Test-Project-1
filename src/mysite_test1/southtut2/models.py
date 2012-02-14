from django.db import models
import sha

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=255)
    password_salt = models.CharField(max_length=8,null=True)
    password_hash = models.CharField(max_length=40, null=True)
    name = models.TextField()
    
    def check_password(self,password):
        return sha.sha(self.password_salt + password).hexdigest() == self.password_hash