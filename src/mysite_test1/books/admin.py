from django.contrib import admin
from mysite_test1.books.models import Publisher, Author, Book

class AuthorAdmin(admin.ModelAdmin):
    list_display = ('first_name','last_name','email')
    search_fields = ('first_name', 'last_name')

class BookAdmin(admin.ModelAdmin):
    list_display = ('title','publisher','publication_date')
    list_filter = ('publication_date',) # works as long as there are at least 2 values to choose from
    date_hierarchy = 'publication_date'
    ordering = ('-publication_date',)
    #fields = ('title', 'authors', 'publisher', 'publication_date')
    filter_horizontal = ('authors',) # improve display of many-to-many field
    raw_id_fields = ('publisher',) # improve entry of foreign key field

admin.site.register(Publisher)
admin.site.register(Author,AuthorAdmin)
admin.site.register(Book, BookAdmin)